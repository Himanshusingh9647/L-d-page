import os
import re

controllers_dir = r"c:\Users\himan\Downloads\l&d prototype\l&d prototype\backend\LDPortal.API\Controllers"

for filename in os.listdir(controllers_dir):
    if filename.endswith(".cs"):
        filepath = os.path.join(controllers_dir, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        # Remove field injection
        content = re.sub(r'^\s*private readonly IAuditService _auditService;\s*\n', '', content, flags=re.MULTILINE)
        
        # Remove IAuditService from constructor parameters
        content = re.sub(r',\s*IAuditService\s+auditService', '', content)
        content = re.sub(r'IAuditService\s+auditService\s*,', '', content)
        content = re.sub(r'IAuditService\s+auditService', '', content)
        
        # Remove assignment in constructor
        content = re.sub(r'^\s*_auditService\s*=\s*auditService;\s*\n', '', content, flags=re.MULTILINE)

        # Remove usages like await _auditService.LogAsync(...);
        content = re.sub(r'^\s*await _auditService\.LogAsync[^;]+;\s*\n', '', content, flags=re.MULTILINE)

        # There might be some usage without await or assigned to variables? Highly unlikely, but we'll check.
        # Just in case there are some left over logAsync calls that span multiple lines, let's use a more robust regex
        content = re.sub(r'\s*await _auditService\.LogAsync\([\s\S]*?\);', '', content)

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)

print("Done removing IAuditService.")
