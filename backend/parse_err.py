import re

with open('error.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Look for: unable to resolve type hint for function "FUNCTION_NAME"
matches = re.findall(r'unable to resolve type hint for function &quot;([^&]+)&quot;', html)
if matches:
    print("Found missing type hints for functions:", set(matches))
else:
    print("No matches found for unable to resolve type hint.")

matches2 = re.findall(r'<td>msg</td>.*?<pre>([^<]+)</pre>', html, re.DOTALL)
if matches2:
    print("Found msg variables:")
    for m in matches2:
        print(m.strip())
