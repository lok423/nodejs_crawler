import json
import tfidf
import time
import RAKE
import textrank
import random
import re
import nltk
import json
import os

from nltk import pos_tag
from nltk.chunk import conlltags2tree
from nltk.tree import Tree
from string import punctuation
from nltk.tag import StanfordNERTagger
from nltk.tokenize import TweetTokenizer, sent_tokenize
# from nltk.corpus import stopwords
# stopWords = set(stopwords.words('english'))
RAKE_STOPLIST = 'stoplists/SmartStoplist.txt'
# st = StanfordNERTagger(os.environ.get('STANFORD_MODELS'))

st = StanfordNERTagger('./stanford-ner-2018-02-27/classifiers/english.all.3class.distsim.crf.ser.gz',
					   './stanford-ner-2018-02-27/stanford-ner.jar',
					   encoding='utf8')





TAG_RE = re.compile(r'<[^>]+>')
HEX_RE = re.compile(r'&[^;]+;')

tokenizer_words = TweetTokenizer()

start_time = time.time()
article_array = json.loads(open('../data/articles.json').read())
news_list = []
features_list = []
opinion_list = []
teaching_list = []
sectors_list = []
future_list = []

def load_stop_words(stop_word_file):
    """
    Utility function to load stop words from a file and return as a list of words
    @param stop_word_file Path and file name of a file containing stop words.
    @return list A list of stop words.
    """
    stop_words = []
    for line in open(stop_word_file):
        if line.strip()[0:1] != "#":
            for word in line.split():  # in case more than one per line
                stop_words.append(word)
    stop_words += list(punctuation)
    return stop_words

def remove_tags(text):
    return TAG_RE.sub('', text)

def remove_hex(text):
    return HEX_RE.sub('', text)

def stanfordNE2BIO(tagged_sent):
    bio_tagged_sent = []
    prev_tag = "O"
    for token, tag in tagged_sent:
        if token !='':
            if tag == "O": #O
                bio_tagged_sent.append((token, tag))
                prev_tag = tag
                continue
            if tag != "O" and prev_tag == "O": # Begin NE
                bio_tagged_sent.append((token, "B-"+tag))
                prev_tag = tag
            elif prev_tag != "O" and prev_tag == tag: # Inside NE
                bio_tagged_sent.append((token, "I-"+tag))
                prev_tag = tag
            elif prev_tag != "O" and prev_tag != tag: # Adjacent NE
                bio_tagged_sent.append((token, "B-"+tag))
                prev_tag = tag

    return bio_tagged_sent


def stanfordNE2tree(ne_tagged_sent):
    bio_tagged_sent = stanfordNE2BIO(ne_tagged_sent)
    sent_tokens, sent_ne_tags = zip(*bio_tagged_sent)
    # print(sent_tokens)
    sent_pos_tags = [pos for token, pos in pos_tag(sent_tokens)]

    sent_conlltags = [(token, pos, ne) for token, pos, ne in zip(sent_tokens, sent_pos_tags, sent_ne_tags)]
    ne_tree = conlltags2tree(sent_conlltags)
    return ne_tree



stopWords = load_stop_words(RAKE_STOPLIST)
# print(stopWords)

for index, category in enumerate(article_array):
    if index==0:
        i = 0
        articleNo = 0
        for article in category:
            article_start_time = time.time()
            print("start processing another article....")
            # print(article)
            # news_list.append({"title": article['title'].encode('ascii', 'ignore')})
            tokens_sentences = []

            for sentence in article['content']:
                sentence = remove_tags(sentence)
                sentence = remove_hex(sentence)
                sentence.encode('ascii', 'ignore')
                # print(sentence)
                if len(sentence)!=0:
                    # [x.lower() for x in tokenizer_words.tokenize(sentence)]
                    split_to_word = tokenizer_words.tokenize(sentence)
                    # print(split_to_word)
                    if len(split_to_word)!=0:
                        try:
                            classified_text = st.tag(split_to_word)
                        except:
                            print("error occur",split_to_word)
                            print("occur at", articleNo)
                            pass
                        # print(classified_text)
                        else:
                            
                            ne_tree = stanfordNE2tree(classified_text)
                            # print(ne_tree)
                            ne_in_sent = []
                            for subtree in ne_tree:
                                if type(subtree) == Tree: # If subtree is a noun chunk, i.e. NE != "O"
                                    if subtree.label() != 'PERSON':
                                        ne_label = subtree.label()
                                        ne_string = " ".join([token for token, pos in subtree.leaves()])
                                        # ne_in_sent.append((ne_string, ne_label))
                                        ne_in_sent.append(ne_string)
                            # print (ne_in_sent)

                            for word in classified_text:
                                if word[1] == 'O':
                                    if word[0].lower() not in stopWords:
                                        tokens_sentences.append(word[0])
                            tokens_sentences += ne_in_sent

                # print(tokens_sentences)
                    # for word_index, word in enumerate(classified_text[:4]):
                    #     if word_index >0:
                    #         if word[1] != 'O':
                    #             # print(word_index,word[1])
                    #             previous_word = classified_text[word_index-1]
                    #             if word[1] == previous_word[1]:
                    #                 print(word_index, previous_word[0], word[0])
                    #
                    #             else:





                    # for word in tokenizer_words.tokenize(sentence):
                    #     word = word.lower()
                    #     if word not in stopWords:
                    #         tokens_sentences.append(word)

                # text=nltk.text.Text(tokens_sentences)
                # print(i)
                # collocations = text.collocations()
                # i+=1

                # fdist1=FreqDist(keywords)
                # print(fdist1.most_common(50))
            
            open_file_time = time.time()
            filename = "../data/demofile.json"
            print("Reading %s" % filename)
            try:
                with open(filename, "rt") as fp:
                    data = json.load(fp)
                # print("Data: %s" % data)
            except IOError:
                print("Could not read file, starting from scratch")
                data = {}
            data.append({
                    'keywords': tokens_sentences,
                    'title': article['title'].encode('ascii', 'ignore'),
                    'subtitle': article['subtitle'].encode('ascii', 'ignore'),
                    'content': article['content']
                    })
            
            print("Overwriting %s" % filename)
            with open(filename, "wt") as fp:
                json.dump(data, fp)

            print("finish writing")
            end_file_time = time.time() - open_file_time
            print('Done. Elapsed: %d' % end_file_time)

            # news_list.append(
            # )
            articleNo+=1
            article_end_time = time.time() - article_start_time
            print("processing time:",article_end_time)
    # elif index==1:
    #     for article in category:
    #         features_list.append(article['title'])
    # elif index==2:
    #     for article in category:
    #         opinion_list.append(article['title'])
    # elif index==3:
    #     for article in category:
    #         teaching_list.append(article['title'])
    # elif index==4:
    #     for article in category:
    #         sectors_list.append(article['title'])
    # elif index==5:
    #     for article in category:
    #         future_list.append(article['title'])

# json_str = json.dumps(news_list)
# print(json_str)

# f = open("../data/demofile.json", "a+")
# f.write(json_str)


# tokens_sentences = [tokenizer_words.tokenize(sentence) for sentence in news_list ]

# ///////////////////////////////////////////////////////////////////
# tokens_sentences = []
# for sentence in news_list:
#     for word in tokenizer_words.tokenize(sentence):
#         tokens_sentences.append(word)
#
# # print(tokens_sentences)
# random.shuffle(tokens_sentences)
# # print(tokens_sentences)
#
# word_features = ['education', 'student']
#
# def document_features(document): # [_document-classify-extractor]
#     #document_words = set(document) # [_document-classify-set]
#     # print(document_words)
#     '''for word in document_words:
#         print(word)'''
#     features = {}
#     for word in word_features:
#         features['contains({})'.format(word)] = (word in document)
#     return features
#
# features = document_features(word_features)
# print(features)

# ///////////////////////////////////////////////////////////////////

# print(news_list[:100])
#
# print("=== 3. RAKE")
# rake = RAKE.Rake(RAKE_STOPLIST, min_char_length=2, max_words_length=5)
# for page in news_list:
#     page["rake_results"] = rake.run(page["title"])
# print("RAKE: %d" % (time.time() - start_time))
#
#
#
# document_frequencies = {}
# document_count = len(news_list)
# for page in news_list:
#     page["tfidf_frequencies"] = tfidf.get_word_frequencies(page["title"])
#     for word in page["tfidf_frequencies"]:
#         document_frequencies.setdefault(word, 0)
#         document_frequencies[word] += 1
# sortby = lambda x: x[1]["score"]
# for page in news_list:
#     for word in page["tfidf_frequencies"].items():
#         #print(word)
#         word_frequency = word[1]["frequency"]
#         docs_with_word = document_frequencies[word[0]]
#         #print(word_frequency)
#         #print(docs_with_word)
#         word[1]["score"] = tfidf.calculate(word_frequency, document_count, docs_with_word)
#
#     page["tfidf_results"] = sorted(page["tfidf_frequencies"].items(), key=sortby, reverse=True)
# print("TF-IDF: %d" % (time.time() - start_time))
#
#
# for page in news_list:
#     textrank_results = textrank.extractKeyphrases(page["title"])
#     page["textrank_results"] = sorted(textrank_results.items(), key=lambda x: x[1], reverse=True)
# print("TextRank: %d" % (time.time() - start_time))
#
#
# print("=== 6. Results")
# for page in news_list:
#     print("-------------------------")
#     # print("URL: %s" % page["url"])
#     # print("RAKE:")
#     # for result in page["rake_results"][:5]:
#     #     print(" * %s" % result[0])
#     # print("TF-IDF:")
#     # for result in page["tfidf_results"][:5]:
#     #     print(" * %s" % result[0])
#     print("TextRank:")
#     for result in page["textrank_results"][:5]:
#         print(" * %s" % result[0])

end_time = time.time() - start_time
print('Done. total time: %d' % end_time)
    # for article in category:
        # message = "category: " + article['category'] +" title: " +article['title']
        # print(message.encode('ascii', 'ignore')[:100])


# import sys
#
# if __name__ == "__main__":
#     st = sys.argv[1]
#     print(st + "from python")
