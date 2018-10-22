class Article {



  constructor(precategory,title, description, author, date, content, source, tags,categorize) {
    //this.id = id;
    this.precategory = precategory;
    this.title = title;
    this.description = description;
    this.author = author;
    this.date = date;
    this.content = content;
    this.source = source;
    this.tags = tags;
    this.categorize = categorize
  }
}

module.exports = {Article};
