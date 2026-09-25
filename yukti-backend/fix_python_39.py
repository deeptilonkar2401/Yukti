import os
import re

def fix_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original = content

        # Replace type | None with Optional[type]
        content = re.sub(r'([a-zA-Z0-9_\[\], ]+?)\s*\|\s*None', r'Optional[\1]', content)

        # For safety, replace X | Y -> Union[X, Y]
        content = re.sub(r'([a-zA-Z0-9_\[\]]+?)\s*\|\s*([a-zA-Z0-9_\[\]]+)', r'Union[\1, \2]', content)

        if content != original:
            lines = content.split('\n')
            insert_idx = 0
            for i, line in enumerate(lines):
                if line.startswith('from __future__') or line.startswith('#'):
                    continue
                if line.strip():
                    insert_idx = i
                    break
            
            lines.insert(insert_idx, "from typing import Optional, Union")
            content = '\n'.join(lines)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed {filepath}")
    except Exception as e:
        print(f"Error on {filepath}: {e}")

for root, _, files in os.walk('app'):
    for file in files:
        if file.endswith('.py'):
            fix_file(os.path.join(root, file))
