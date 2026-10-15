extends Node
## Optional immutable HTTPS packs. Bundled art is always the offline fallback.
## Call load_pack at startup. A verified cache is usable immediately and offline.
func load_pack(base: String, pin: Dictionary, fallback_root: String) -> Dictionary:
	if not safe_pin(pin):return {"error":"Invalid trusted release pin."}
	var directory := cache_directory(pin)
	if verify_cache(directory,pin) or await download_pack(base,pin):
		return {"root":directory,"pack":JSON.parse_string(FileAccess.get_file_as_string(directory+"/pack.json")),"catalog":JSON.parse_string(FileAccess.get_file_as_string(directory+"/numeric-catalog.json")),"source":"cache"}
	return {"root":fallback_root,"pack":JSON.parse_string(FileAccess.get_file_as_string(fallback_root+"/pack.json")),"source":"bundled"}
static func safe_pin(pin: Dictionary) -> bool:
	var pattern := RegEx.new()
	pattern.compile("^[a-z0-9-]+$")
	if pattern.search(str(pin.get("id","")))==null:return false
	pattern.compile("^[0-9]+\\.[0-9]+\\.[0-9]+$")
	if pattern.search(str(pin.get("version","")))==null:return false
	pattern.compile("^[a-f0-9]{64}$")
	return pattern.search(str(pin.get("sha256","")))!=null

static func cache_directory(pack: Dictionary) -> String:
	return "user://asset-library/%s/%s/%s" % [pack["id"], pack["version"], str(pack["sha256"]).left(16)]

static func safe_path(path: String) -> bool:
	if path.is_empty() or path.begins_with("/") or "\\" in path or ":" in path or "%" in path:return false
	for part: String in path.split("/"):
		if part in ["", ".", ".."]:return false
	return path.ends_with(".png") or path.ends_with(".json")

static func parse_release(bytes: PackedByteArray, pack: Dictionary) -> Dictionary:
	if bytes.size() > 262144 or bytes.hex_encode().is_empty():return {}
	var hash_context := HashingContext.new()
	hash_context.start(HashingContext.HASH_SHA256)
	hash_context.update(bytes)
	if hash_context.finish().hex_encode() != str(pack["sha256"]):return {}
	var parsed: Variant = JSON.parse_string(bytes.get_string_from_utf8())
	if not parsed is Dictionary:return {}
	if parsed.get("schema") != "game-assets.release/v1" or parsed.get("id") != pack["id"] or parsed.get("version") != pack["version"]:return {}
	var files: Variant = parsed.get("files")
	if not files is Dictionary or files.size() > 64 or not files.has("numeric-catalog.json") or not files.has("pack.json"):return {}
	var total := 0
	for path: String in files:
		var row: Variant = files[path]
		if not safe_path(path) or not row is Dictionary:return {}
		var length := int(row.get("size", -1))
		if length < 0 or length > 16777216 or str(row.get("sha256", "")).length() != 64:return {}
		total += length
	if total > 67108864:return {}
	return parsed

static func verify_cache(directory: String, pack: Dictionary) -> bool:
	if not FileAccess.file_exists(directory + "/ready.json"):return false
	var release := parse_release(FileAccess.get_file_as_bytes(directory + "/release.json"), pack)
	if release.is_empty():return false
	for path: String in release["files"]:
		var full := directory + "/" + path
		if not FileAccess.file_exists(full):return false
		var file := FileAccess.open(full, FileAccess.READ)
		if file == null or file.get_length() != int(release["files"][path]["size"]):return false
		file.close()
		if FileAccess.get_sha256(full) != str(release["files"][path]["sha256"]):return false
	return true

func download_pack(base: String, pack: Dictionary) -> bool:
	if not safe_pin(pack) or not base.begins_with("https://") or "@" in base or "?" in base or "#" in base:return false
	base=base.trim_suffix("/")
	var prefix: String = base + "/releases/" + str(pack["id"]) + "/" + str(pack["version"]) + "/"
	var bytes: PackedByteArray = await fetch_bytes(prefix + "release.json", 262144)
	var release := parse_release(bytes, pack)
	if release.is_empty():return false
	var directory := cache_directory(pack)
	DirAccess.make_dir_recursive_absolute(directory)
	if not store(directory + "/release.json", bytes):return false
	for path: String in release["files"]:
		var row: Dictionary = release["files"][path]
		bytes = await fetch_bytes(prefix + path, int(row["size"]) + 1)
		var hash_context := HashingContext.new()
		hash_context.start(HashingContext.HASH_SHA256)
		hash_context.update(bytes)
		if bytes.size() != int(row["size"]) or hash_context.finish().hex_encode() != str(row["sha256"]):return false
		DirAccess.make_dir_recursive_absolute(directory + "/" + path.get_base_dir())
		if not store(directory + "/" + path, bytes):return false
	if not store(directory + "/ready.json", "{}".to_utf8_buffer()):return false
	return verify_cache(directory, pack)

static func store(path: String, bytes: PackedByteArray) -> bool:
	var file := FileAccess.open(path + ".tmp", FileAccess.WRITE)
	if file == null:return false
	file.store_buffer(bytes)
	file.flush()
	var ok := file.get_error() == OK
	file.close()
	return ok and DirAccess.rename_absolute(path + ".tmp", path) == OK

func fetch_bytes(url: String, limit: int) -> PackedByteArray:
	var request := HTTPRequest.new()
	request.timeout = 15.0
	request.body_size_limit = limit
	request.max_redirects = 0
	add_child(request)
	if request.request(url) != OK:
		request.queue_free()
		return PackedByteArray()
	var result: Array = await request.request_completed
	request.queue_free()
	return result[3] if result[0] == HTTPRequest.RESULT_SUCCESS and result[1] == 200 else PackedByteArray()
