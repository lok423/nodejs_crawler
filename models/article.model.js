class Article {



  constructor(category,title, subtitle, author, date, content, source, tags) {
    //this.id = id;
    this.category = category;
    this.title = title;
    this.subtitle = subtitle;
    this.author = author;
    this.date = date;
    this.content = content;
    this.source = source;
    this.tags = tags;
  }
}

module.exports = {Article};
