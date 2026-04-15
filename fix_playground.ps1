$path = "src/pages/LegalPlayground.tsx"
$content = Get-Content -Path $path -Raw -Encoding utf8

# Replace broken characters
$content = $content -replace "â\?\?€", "—"
$content = $content -replace "â\?\?‡", "◆"
$content = $content -replace "â\?\? ", "─"
$content = $content -replace "Â·", "·"
$content = $content -replace "â†’", "→"
$content = $content -replace "â†", "←"

# Fix helper name
$content = $content.Replace("const EMPTY_STATE =", "const EmptyState =")

# Fix imports - broader match
$content = $content -replace "DEFAULT_TEST_MCQS,", "DEFAULT_TEST_MCQS, DEFAULT_TEMPLATES, DEFAULT_FLASHCARD_DECKS,"

# Fix SECTION_DIRECTORY usage
$content = $content.Replace("{SECTION_DIRECTORY.map((item) => (", "{SECTIONS_DIRECTORY.map((item: any) => (")

# Final Cleanup of specific mangled strings seen in view_file
$content = $content.Replace("â”€", "─")
$content = $content.Replace("â—†", "◆")
$content = $content.Replace("â€”", "—")

$content | Set-Content -Path $path -Encoding utf8
