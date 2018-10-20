import json



# tags_array = []
# article_array = json.loads(open('../data/articles.json').read())

# for category in article_array:
#     for article in category:
#         for tag in article['tags']:
#             if not (tag.lower() in tags_array):
#                 tags_array.append(tag.encode('ascii', 'ignore').lower())



# json_str = json.dumps(tags_array)
# print(json_str)

# f = open("../data/tags.json", "w")
# f.write(json_str)

tag_array = json.loads(open('../data/tags.json').read())
tag_list = [x.encode("ascii") for x in tag_array]
schools=[]

for index, tag in enumerate(tag_list):
    if "school" in tag:
        # print(index)
        tag_list.pop(index)
        schools.append(tag)

# print(schools)
print("////////////////")
print(tag_list)






