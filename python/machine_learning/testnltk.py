import nltk
import random
import time
from nltk.corpus import movie_reviews
start_time = time.time()

documents = [(list(movie_reviews.words(fileid)), category)
    for category in movie_reviews.categories()
    for fileid in movie_reviews.fileids(category)]
random.shuffle(documents)
# print(documents)
# print(movie_reviews)



all_words = nltk.FreqDist(w.lower() for w in movie_reviews.words())
# print(list(all_words))
word_features = list(all_words)[:2000] # [_document-classify-all-words]
# print(word_features)

def document_features(document): # [_document-classify-extractor]
    document_words = set(document) # [_document-classify-set]
    # print(document_words)
    '''for word in document_words:
        print(word)'''
    features = {}
    for word in word_features:
        features['contains({})'.format(word)] = (word in document_words)
    return features

# for (d,c) in documents:
#     print(c)
#
featuresets = [(document_features(d), c) for (d,c) in documents]




# print(featuresets[:1])
print(documents[:1])
train_set, test_set = featuresets[100:], featuresets[:100]
classifier = nltk.NaiveBayesClassifier.train(train_set)

print(nltk.classify.accuracy(classifier, test_set))
classifier.show_most_informative_features(5)



end_time = time.time() - start_time
print('Done. Elapsed: %d' % end_time)
