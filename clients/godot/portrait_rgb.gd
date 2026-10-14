extends RefCounted
const KEYS := ["skin","hair","hairAccent","outfit","accessory","iris"]
static func valid(value: Variant) -> bool:
	if not value is Dictionary:return false
	for key: Variant in value:
		if key not in KEYS:return false
		var n: Variant = value[key]
		if typeof(n) not in [TYPE_INT,TYPE_FLOAT] or not is_finite(float(n)) or float(n)!=floor(float(n)) or float(n)<0 or float(n)>16777215:return false
	return true
static func resolve(identity: Dictionary, key: String, fallback: Color) -> Color:
	var values: Variant = identity.get("portrait_rgb",{})
	if not valid(values) or not values.has(key):return fallback
	var n := int(values[key])
	return Color8((n>>16)&255,(n>>8)&255,n&255)
static func stable(identity: Dictionary) -> String:
	var values: Variant = identity.get("portrait_rgb",{})
	if not valid(values):return ""
	var result: Array = []
	for key: String in KEYS:result.append(values.get(key,-1))
	return JSON.stringify(result)
