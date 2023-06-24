# Exma

A schema file formatting standard used to define properties of data 
collections. Originally, schema files are currently used to define 
database structures. This file format builds on top of that adding 
arbitrary attributes for fields, validation, formats etc. so generators
are more informed to produce more accurate and relevant code. The 
projects in this monorepo are the following.

1. `@exma/parser` - Parses a schema file to AST
2. `@exma/language` - A language server used by vscode/vim to read 
   from `.exma` files and check for syntax errors and to enable 
   intellisense for the file type.
3. `@exma/generator` - A programmatical command line interface used 
   by projects and that calls on external generators to make relevant 
   code (like SQL schema, GraphQL, react components, etc.)
4. `exma` - A stand alone command line tool used that calls on 
   external generators to make relevant code (like SQL schema, GraphQL, 
   react components, etc.) 

## Standalone Install

```bash
$ npm i -D exma
```

## Standalone Usage

```bash
$ npx exma -i ./schema.exma -o ./output
```

You can also create a config file like the following

```js
// ./chisma.config.js
module.exports = {
  input: './schema.exma',
  output: './output'
};
```

After saving this to your project folder you can call the following in 
terminal.

```bash
$ npx exma
```

## 1. Specifications

The primary purpose of this specifications is to provide a simple and 
flexible syntax that any generator can use as a basis to render code. 
At this point, Exma does not care how generators use the final 
parsed code.

## 1.1. Objects

Objects are a collection hash of properties. In Exma modeling, 
everything can be classified as an object of some sort. Objects are 
defined as the following.

```
[object type] [object name] [..object attributes]? {
  [property name] [property type]? [..property attributes]?
}
```

The syntax does not require the use of separators like commas (`,`) and
semicolons (`;`) because the parse can logically make a determination 
of separations. Also the syntax simplifies defining objects and arrays 
using only curly braces (`{}`).


 - `[object type]` - any phrase matching `^[a-z]+$` 
   - **Required**
   - only small letters
   - ex. `enum`, `type`, `object`, `props`, `model`, ..
 - `[object name]` - any phrase matching `^[a-zA-Z0-9_]+$`
   - **Required**
   - no spaces or special characters
   - ex. `Roles`, `Country`, `level_1`, ..
 - `[..object attributes]` - an attribute phrase 
   - **Optional**
   - matching `^@[a-zA-Z0-9_\.]+$` if a flag resolving to `true`
   - matching `^@[a-zA-Z0-9_\.]+\([^\)]\)$` if a function accepting 
     the following separated by commas:
     - `[object name]`
     - Strings denoted with quotes like `"foo"`
     - Other scalars including number, boolean, null
   - ex. `@label("Address", "Addresses") @searchable @field.input(Text)`
 - `[property name]` - any phrase matching `^[a-zA-Z0-9_]+$`
   - **Required**
   - no spaces or special characters
   - ex. `Roles`, `Country`, `level_1`, ..
 - `[property type]` - any phrase matching anything 
   - **Optional**
   - only small letters
   - ex. `enum`, `type`, `object`, `props`, `model`, ..
 - `[..property attributes]` - an attribute phrase 
   - **Optional**
   - matching `^@[a-zA-Z0-9_\.]+$` if a flag resolving to `true`
   - matching `^@[a-zA-Z0-9_\.]+\([^\)]\)$` if a function accepting 
     the following separated by commas:
     - `[object name]`
     - Strings denoted with quotes like `"foo"`
     - Other scalars including number, boolean, null
   - ex. `@label("Address", "Addresses") @searchable @field.input(Text)`

With the specifications above the following examples are valid syntax.

### Example 1. Enum

```js
enum Roles {
  ADMIN
  MANAGER
  USER
}
```

### Example 2. Enum Literal

```js
enum Roles {
  ADMIN "Admin"
  MANAGER "Manager"
  USER "User"
}
```

### Example 3. Props

```js
props Countries {
  options {
    { label "United States" value "US" }
    { label "Mexico" value "MX" }
    { label "Canada" value "CA" }
  }
}
```

### Example 4. Type

```js
type Text {
  type "text"
}
```

### Example 5. Object

```js
object Address @label("Address", "Addresses") {
  street  string    @field.input(Text) @is.required @list.hide
  city    string    @field.input(Text) @is.required
  country string(2) @field.select(Countries) @is.option(Countries) @view.text(Uppercase)
  postal  string    @field.input(Text) @is.required
}
```

### Example 6. Schema

```js
model User @label("User", "Users") {
  id       string       @label("ID")         @id @default("nanoid(20)")
  username string       @label("Username")   @searchable @field.input(Text) @is.required
  password string       @label("Password")   @field.password @is.required @list.hide @view.hide
  role     Roles        @label("Role")       @filterable @field.select @list.text(Uppercase) @view.text(Uppercase)
  address  Address?     @label("Address")    @list.hide
  age      number(3)    @label("Age")        @unsigned @filterable @sortable @field.number(Age) @is.gt(0) @is.lt(150)
  salary   number(10,2) @label("Salary")     @insigned @filterable @sortable @field.number(Price) @list.number @view.number
  balance  number       @label("Balance")    @filterable @sortable @field.number({ step 0.01 }) @list.number({ step 0.01 }) @view.number
  bio      text         @label("Bio")        @field.markdown
  active   boolean      @label("Active")     @default(true) @filterable @field.switch @list.yesno @view.yesno
  created  Date         @label("Created")    @default(now()) @filterable @sortable @list.date(Pretty)
  updated  Date         @label("Updated")    @default(updated()) @filterable @sortable @list.date(Pretty)
  company  Company?     @label("My Company") 
}
```