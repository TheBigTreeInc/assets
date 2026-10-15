extends RefCounted
## Portable v2 codec. bindings is game-owned; catalog is the trusted library catalog.
const PART_KEYS := {"face":"portrait_archetype","eyes":"eye_package","nose":"nose_package","mouth":"mouth_package","hair":"hair","clothing":"torso","eyewear":"goggle_package","faceCovering":"lower_face_package","augmentation":"detail_package"}
const COLOR_KEYS := {"skin":"skin","hair":"hair","hairAccent":"hairAccent","clothing":"outfit","accessory":"accessory","iris":"iris"}
static func number(value: Variant, maximum: int = 2147483647) -> bool:
	return typeof(value) in [TYPE_INT,TYPE_FLOAT] and is_finite(float(value)) and float(value)==floor(float(value)) and float(value)>=0 and float(value)<=maximum
static func exact(value: Variant, keys: Array) -> bool:
	if not value is Dictionary or value.size()!=keys.size():return false
	for key: Variant in keys:
		if not value.has(key):return false
	return true
static func decode(code: Dictionary, catalog: Dictionary, bindings: Dictionary) -> Dictionary:
	if catalog.get("schema")!="portrait-library.catalog/v2" or int(catalog.get("library",-1))!=2:return {"error":"Unsupported catalog."}
	if not exact(code,["format","library","parts","colors"]) or not number(code.get("format")) or int(code["format"])!=2 or not number(code.get("library")) or int(code["library"])!=2:return {"error":"Unsupported appearance format or library."}
	if not exact(code["parts"],PART_KEYS.keys()) or not exact(code["colors"],COLOR_KEYS.keys()):return {"error":"Invalid parts or colours."}
	var appearance: Dictionary = {"style_family":bindings["family"],"portrait_rgb":{}}
	for category: String in PART_KEYS:
		var selected: Variant = code["parts"][category]
		if not number(selected):return {"error":"Part IDs must be integers."}
		var found := false
		for key: String in catalog["parts"][category]:
			if int(catalog["parts"][category][key])==int(selected):
				appearance[PART_KEYS[category]]=bindings["slots"][category][key]
				found=true
				break
		if not found:return {"error":"Unknown part ID."}
	for color: String in COLOR_KEYS:
		if not number(code["colors"][color],16777215):return {"error":"Invalid RGB."}
		appearance["portrait_rgb"][COLOR_KEYS[color]]=int(code["colors"][color])
	return {"appearance":appearance}
static func encode(identity: Dictionary, catalog: Dictionary, bindings: Dictionary) -> Dictionary:
	if catalog.get("schema")!="portrait-library.catalog/v2" or int(catalog.get("library",-1))!=2 or identity.get("style_family")!=bindings.get("family"):return {"error":"Unsupported catalog or game binding."}
	var code: Dictionary = {"format":2,"library":2,"parts":{},"colors":{}}
	for category: String in PART_KEYS:
		var found := false
		for key: String in bindings["slots"][category]:
			if identity.get(PART_KEYS[category])==bindings["slots"][category][key]:
				code["parts"][category]=int(catalog["parts"][category][key])
				found=true
				break
		if not found:return {"error":"Game part has no library binding."}
	for color: String in COLOR_KEYS:
		var selected: Variant = identity.get("portrait_rgb",{}).get(COLOR_KEYS[color])
		if not number(selected,16777215):return {"error":"Exact RGB values required."}
		code["colors"][color]=int(selected)
	return code
