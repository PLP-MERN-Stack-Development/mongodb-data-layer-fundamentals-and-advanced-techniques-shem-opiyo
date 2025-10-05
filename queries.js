// queries.js  
// 

use("plp_bookstore");

// ---------- Task 2: Basic CRUD Operations ----------

print("\n=== TASK 2: Basic CRUD ===");

// 1) Find all books in a specific genre (example: "Fiction")
print("\n-- Find all Fiction books --");
printjson(db.books.find({ genre: "Fiction" }).toArray());

// 2) Find books published after a certain year (example: after 2015)
print("\n-- Books published after 2015 --");
printjson(db.books.find({ published_year: { $gt: 2015 } }).toArray());

// 3) Find books by a specific author (example: "A. Kumar")
print("\n-- Books by A. Kumar --");
printjson(db.books.find({ author: "A. Kumar" }).toArray());

// 4) Update the price of a specific book (example: set price of "The Last Algorithm" to 25.00)
print("\n-- Update price of a specific book --");
printjson(db.books.updateOne({ title: "The Last Algorithm" }, { $set: { price: 25.00 } }));
printjson(db.books.findOne({ title: "The Last Algorithm" }));

// 5) Delete a book by its title (example: "Mystery at Dawn")
// Note: This is destructive; uncomment to actually delete.
print("\n-- (Commented) Delete a book by title --");
// printjson(db.books.deleteOne({ title: "Mystery at Dawn" }));

// ---------- Task 3: Advanced Queries ----------

print("\n=== TASK 3: Advanced Queries ===");

// Find books that are both in_stock and published after 2010
print("\n-- In-stock and published after 2010 --");
printjson(db.books.find({ in_stock: true, published_year: { $gt: 2010 } }).toArray());

// Use projection to return only title, author, price
print("\n-- Projection: title, author, price --");
printjson(db.books.find({}, { projection: { _id: 0, title: 1, author: 1, price: 1 } }).toArray());

// Sorting by price ascending
print("\n-- Sort by price ascending --");
printjson(db.books.find({}, { projection: { _id:0, title:1, price:1 } }).sort({ price: 1 }).toArray());

// Sorting by price descending
print("\n-- Sort by price descending --");
printjson(db.books.find({}, { projection: { _id:0, title:1, price:1 } }).sort({ price: -1 }).toArray());

// Pagination: 5 books per page (page 1 = skip 0, page 2 = skip 5)
const pageSize = 5;
print("\n-- Pagination: page 1 (first 5) --");
printjson(db.books.find({}, { projection: { _id:0, title:1 } }).sort({ title:1 }).skip(0).limit(pageSize).toArray());

print("\n-- Pagination: page 2 (next 5) --");
printjson(db.books.find({}, { projection: { _id:0, title:1 } }).sort({ title:1 }).skip(pageSize).limit(pageSize).toArray());

// ---------- Task 4: Aggregation Pipeline ----------

print("\n=== TASK 4: Aggregation Pipelines ===");

// 1) Average price of books by genre
print("\n-- Average price by genre --");
printjson(db.books.aggregate([
  { $group: { _id: "$genre", avgPrice: { $avg: "$price" }, count: { $sum: 1 } } },
  { $sort: { _id: 1 } }
]).toArray());

// 2) Author with the most books
print("\n-- Author with most books --");
printjson(db.books.aggregate([
  { $group: { _id: "$author", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 1 }
]).toArray());

// 3) Group books by publication decade and count them
print("\n-- Count by publication decade --");
printjson(db.books.aggregate([
  { $project: { published_year: 1, title: 1, decade: { $multiply: [ { $floor: { $divide: ["$published_year", 10] } }, 10 ] } } },
  { $group: { _id: "$decade", count: { $sum: 1 } } },
  { $sort: { _id: 1 } }
]).toArray());

// ---------- Task 5: Indexing and explain() ----------

print("\n=== TASK 5: Indexing & explain() ===");

// Show current indexes
print("\n-- Existing indexes --");
printjson(db.books.getIndexes());

// Explain BEFORE creating indexes (search by title)
print("\n-- explain() BEFORE indexes (title search) --");
const explainBefore = db.books.find({ title: "The Last Algorithm" }).explain("executionStats");
printjson(explainBefore);

// Create an index on title
print("\n-- Creating index on title --");
printjson(db.books.createIndex({ title: 1 }));

// Create compound index on author + published_year
print("\n-- Creating compound index on author and published_year --");
printjson(db.books.createIndex({ author: 1, published_year: -1 }));

// Show indexes after creation
print("\n-- Indexes AFTER creation --");
printjson(db.books.getIndexes());

// Explain AFTER creating indexes (same query)
print("\n-- explain() AFTER indexes (title search) --");
const explainAfter = db.books.find({ title: "The Last Algorithm" }).explain("executionStats");
printjson(explainAfter);

// Helpful summary values to look at:
//  - executionStats.executionTimeMillis
//  - executionStats.totalDocsExamined
//  - queryPlanner.winningPlan.stage  (COLLSCAN before vs IXSCAN after)
