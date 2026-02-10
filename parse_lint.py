
import json

try:
    with open('final_lint.json', 'r') as f:
        data = json.load(f)
    
    for file in data:
        if file['errorCount'] > 0 or file['warningCount'] > 0:
            print(f"File: {file['filePath']}")
            for msg in file['messages']:
                print(f"  Line {msg['line']}:{msg['column']} - {msg['ruleId']} - {msg['message']}")
except Exception as e:
    print(f"Error: {e}")
