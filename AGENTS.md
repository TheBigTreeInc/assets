# Maintaining the shared character engine

Read docs/CHARACTER_ENGINE_SPEC.adoc and docs/CONTRIBUTOR_SPEC.adoc first. They are normative for architecture and contributions. docs/PORTRAIT_SPEC.md is the current implemented runtime contract. Keep engine-capabilities.json accurate; specified future features must not be reported as implemented.

Keep one artwork store and one descriptor per real item. Never duplicate release art folders or client art. Item/category IDs and existing render identities remain permanent. Adding future alternate representations requires an explicit adapter/schema while retaining existing output. Labels, tags, order, type and retirement are presentation metadata.

Run tools/check_library.py --against the actual change base, tools/check_delivery.py and the JavaScript tests. Keep both AsciiDoc specs, the working example, GitHub workflow and ZipRunner 2.3 metadata with the source. Package using tools/package_ziprunner.py and the pinned upstream validator. Do not include local configuration, credentials, caches or extracted delivery copies.
