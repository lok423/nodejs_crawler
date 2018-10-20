import json

# with open('../data/demofile.json', 'w+') as f:
#     data = f.read()
#     json_str = json.loads(data)
#     print(json_str)

# with open('../data/demofile.json','r+') as f:
#     d = json.load(f)
   
#     d.append({"example":3})
#     print(d)
#     data = json.dumps(d)
#     f.seek(0)
#     f.write(data)


filename = "../data/demofile.json"

print("Reading %s" % filename)
try:
    with open(filename, "rt") as fp:
        data = json.load(fp)
    print("Data: %s" % data)
except IOError:
    print("Could not read file, starting from scratch")
    data = {}

# Add some data
data.append({"example":3})

print("Overwriting %s" % filename)
with open(filename, "wt") as fp:
    json.dump(data, fp)
