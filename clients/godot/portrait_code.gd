class_name PortraitCode
extends RefCounted
## Same canonical decimal code as JavaScript; no native BigInt dependency.
## registry is index.json; items maps category keys to dictionaries keyed by decimal ID strings.

static func _integer(value, maximum: int) -> bool:
	return (typeof(value) == TYPE_INT or typeof(value) == TYPE_FLOAT) and is_finite(float(value)) and float(value) == floor(float(value)) and value >= 0 and value <= maximum

static func defaults(registry: Dictionary) -> Dictionary:
	var value := {"parts": {}, "colors": {}}
	for field in registry.categories:
		value.parts[field.key] = int(field.default)
	for field in registry.colors:
		value.colors[field.key] = str(field.default).trim_prefix("#").hex_to_int()
	return value

static func validate(registry: Dictionary, items: Dictionary, value: Dictionary) -> bool:
	if not value.get("parts") is Dictionary or not value.get("colors") is Dictionary:
		return false
	var part_keys := []
	var color_keys := []
	for field in registry.categories:
		part_keys.append(field.key)
		var id = value.parts.get(field.key, 0 if field.nullable else -1)
		if not _integer(id, 4294967295) or (id == 0 and not field.nullable):
			return false
		if id != 0 and not items.get(field.key, {}).has(str(int(id))):
			return false
	for field in registry.colors:
		color_keys.append(field.key)
		var color = value.colors.get(field.key, str(field.default).trim_prefix("#").hex_to_int() if not field.required else -1)
		if not _integer(color, 16777215):
			return false
	for key in value.parts:
		if key not in part_keys: return false
	for key in value.colors:
		if key not in color_keys: return false
	return true

static func bytes_to_decimal(bytes: PackedByteArray) -> String:
	var digits := [0]
	for byte in bytes:
		var carry: int = byte
		for i in range(digits.size()):
			var n: int = digits[i] * 256 + carry
			digits[i] = n % 10
			carry = n / 10
		while carry:
			digits.append(carry % 10)
			carry = carry / 10
	var result := ""
	for i in range(digits.size() - 1, -1, -1): result += str(digits[i])
	return result

static func decimal_to_bytes(code: String) -> PackedByteArray:
	if code.is_empty() or code.length() > 7000 or code[0] == "0": return PackedByteArray()
	var bytes := PackedByteArray([0])
	for character in code:
		if character < "0" or character > "9": return PackedByteArray()
		var carry := character.unicode_at(0) - 48
		for i in range(bytes.size()):
			var n: int = bytes[i] * 10 + carry
			bytes[i] = n % 256
			carry = n / 256
		while carry:
			bytes.append(carry % 256)
			carry = carry / 256
	bytes.reverse()
	return bytes

static func _write(bytes: PackedByteArray, value: int, length: int) -> void:
	for shift in range((length - 1) * 8, -1, -8): bytes.append((value >> shift) & 255)

static func encode(registry: Dictionary, items: Dictionary, value: Dictionary) -> String:
	if not validate(registry, items, value): return ""
	var part_fields: Array = registry.categories.duplicate()
	var color_fields: Array = registry.colors.duplicate()
	part_fields.sort_custom(func(a, b): return a.id < b.id)
	color_fields.sort_custom(func(a, b): return a.id < b.id)
	var selected := []
	for field in part_fields:
		if value.parts.get(field.key, 0) != 0: selected.append(field)
	var bytes := PackedByteArray([1, selected.size()])
	for field in selected:
		_write(bytes, int(field.id), 2)
		_write(bytes, int(value.parts[field.key]), 4)
	selected = []
	for field in color_fields:
		if field.required or value.colors.get(field.key, str(field.default).trim_prefix("#").hex_to_int()) != str(field.default).trim_prefix("#").hex_to_int(): selected.append(field)
	bytes.append(selected.size())
	for field in selected:
		_write(bytes, int(field.id), 2)
		_write(bytes, int(value.colors[field.key]), 3)
	return bytes_to_decimal(bytes)

static func decode(registry: Dictionary, items: Dictionary, code: String) -> Dictionary:
	var bytes := decimal_to_bytes(code)
	if bytes.size() < 3 or bytes[0] != 1: return {}
	var position := 1
	var value := {"parts": {}, "colors": {}}
	for section in [{"fields":registry.categories,"key":"parts","size":4},{"fields":registry.colors,"key":"colors","size":3}]:
		if position >= bytes.size(): return {}
		var count: int = bytes[position]
		position += 1
		var previous := 0
		for _record in range(count):
			if position + 2 + section.size > bytes.size(): return {}
			var id: int = bytes[position] * 256 + bytes[position + 1]
			position += 2
			if id <= previous: return {}
			previous = id
			var field_key := ""
			for field in section.fields:
				if int(field.id) == id: field_key = field.key
			if field_key.is_empty(): return {}
			var number := 0
			for _byte in range(section.size):
				number = number * 256 + bytes[position]
				position += 1
			if section.key == "parts" and number == 0: return {}
			value[section.key][field_key] = number
	if position != bytes.size() or not validate(registry, items, value): return {}
	for field in registry.categories:
		if not value.parts.has(field.key): value.parts[field.key] = 0
	for field in registry.colors:
		if not value.colors.has(field.key): value.colors[field.key] = str(field.default).trim_prefix("#").hex_to_int()
	if encode(registry, items, value) != code: return {}
	return value
