extends RefCounted
## Numeric appearance v1. Catalog metadata is trusted/bundled; saves contain only IDs/RGB.
const PART_KEYS := {"face":"portrait_archetype","eyes":"eye_package","nose":"nose_package","mouth":"mouth_package","hair":"hair","outfit":"torso","glasses":"goggle_package","mask":"lower_face_package","implant":"detail_package"}
const COLOR_KEYS := {"skin":"skin_color_id","hair":"hair_primary_color_id","hairAccent":"hair_accent_color_id","outfit":"outfit_primary_color_id","accessory":"outfit_accent_color_id","iris":"iris_color_id"}
static func number(value: Variant, maximum: int = 2147483647) -> bool:
	return typeof(value) in [TYPE_INT,TYPE_FLOAT] and is_finite(float(value)) and float(value)==floor(float(value)) and float(value)>=0 and float(value)<=maximum
static func exact(value: Variant, keys: Array) -> bool:
	if not value is Dictionary or value.size()!=keys.size():return false
	for key: Variant in keys:
		if not value.has(key):return false
	return true
static func table(catalog: Dictionary, pack_id: Variant) -> Dictionary:
	if catalog.get("schema")!="modular-portraits.numeric-catalog/v1" or not number(pack_id):return {}
	return catalog.get("packs",{}).get(str(int(pack_id)),{})
static func decode(code: Dictionary, catalog: Dictionary) -> Dictionary:
	if not exact(code,["format","catalog","pack","parts","colors"]):return {"error":"Invalid numeric appearance fields."}
	if not number(code["format"]) or int(code["format"])!=1 or not number(code["catalog"]) or int(code["catalog"])!=int(catalog.get("catalogId",-1)):return {"error":"Unsupported numeric format or catalog."}
	var pack := table(catalog,code["pack"])
	if pack.is_empty() or not exact(code["parts"],PART_KEYS.keys()) or not exact(code["colors"],COLOR_KEYS.keys()):return {"error":"Unknown collection or missing components."}
	var appearance: Dictionary = {"style_family":pack["native"]["family"],"portrait_rgb":{}}
	for slot: String in PART_KEYS:
		var selected: Variant = code["parts"][slot]
		if not number(selected):return {"error":"Component IDs must be integers."}
		var found := false
		for web_id: String in pack["slots"][slot]:
			if int(pack["slots"][slot][web_id])==int(selected):
				appearance[PART_KEYS[slot]]=pack["native"]["slots"][slot][web_id]
				found=true
				break
		if not found:return {"error":"Unknown numeric component."}
	for color: String in COLOR_KEYS:
		if not number(code["colors"][color],16777215):return {"error":"RGB value is outside 0–16777215."}
		appearance["portrait_rgb"][color]=int(code["colors"][color])
		var swatch_index: int = pack["swatches"][color].find("#%06x" % int(code["colors"][color]))
		appearance[COLOR_KEYS[color]]=maxi(0,swatch_index)
	return {"appearance":appearance}
static func encode(identity: Dictionary, catalog: Dictionary, pack_id: int) -> Dictionary:
	var pack := table(catalog,pack_id)
	if pack.is_empty() or identity.get("style_family")!=pack["native"]["family"]:return {"error":"Appearance belongs to another collection."}
	var result: Dictionary = {"format":1,"catalog":int(catalog["catalogId"]),"pack":pack_id,"parts":{},"colors":{}}
	for slot: String in PART_KEYS:
		var found := false
		var native_id := str(identity.get(PART_KEYS[slot],""))
		if native_id.is_empty() and pack["slots"][slot].has("original"):native_id=str(pack["native"]["slots"][slot]["original"])
		for web_id: String in pack["native"]["slots"][slot]:
			if str(pack["native"]["slots"][slot][web_id])==native_id:
				result["parts"][slot]=int(pack["slots"][slot][web_id])
				found=true
				break
		if not found:return {"error":"Native component has no numeric mapping."}
	var overrides: Variant = identity.get("portrait_rgb",{})
	if not overrides is Dictionary:return {"error":"Invalid RGB overrides."}
	for color: String in COLOR_KEYS:
		if overrides.has(color):
			if not number(overrides[color],16777215):return {"error":"Invalid RGB override."}
			result["colors"][color]=int(overrides[color])
		else:
			var index: Variant = identity.get(COLOR_KEYS[color],0)
			if not number(index,23):return {"error":"Invalid legacy palette ID."}
			result["colors"][color]=str(pack["swatches"][color][int(index)]).trim_prefix("#").hex_to_int()
	return result
