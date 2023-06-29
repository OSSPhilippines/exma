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

```
[enum|prop|type|model] [name] [..attributes]? {
  [property name] [property type]? [..property attributes]?
}
```

The syntax does not require the use of separators like commas (`,`) and
semicolons (`;`) because the parse can logically make a determination 
of separations. Also the syntax simplifies defining objects and arrays 
using only curly braces (`{}`).


 - `[enum|prop|type|model]` - any phrase matching `enum|prop|type|model` 
   - **Required**
   - ex. `enum`, `type`, `props`, `model`
 - `[name]` - a capital and camel phrase matching `^[A-Z][a-zA-Z0-9_]*$`
   - **Required**
   - no spaces or special characters
   - ex. `Roles`, `CountryName`, `Level_1`, ..
 - `[..attributes]` - an attribute phrase 
   - **Optional**
   - matching `^@[a-z](\.?[a-z0-9_]+)*$` if resolving to `true`
   - matching `^@[a-z](\.?[a-z0-9_]+)*\([^\)]\)$` if a function accepting 
     the following:
     - `[name]` - An prop name reference
     - Strings denoted with quotes like `"foo"`
     - Other scalars including number, boolean, null
   - ex. `@label("Address" "Addresses") @searchable @field.input(Text)`
 - `[property name]` - any camel phrase matching `^[a-z_][a-zA-Z0-9_]*$`
   - **Required**
   - no spaces or special characters
   - ex. `id`, `firstName`, `level_1`, ..
 - `[property type]` - any Capitalized phrase 
   - **Optional**
   - Should be capitalized
   - Can optionally end with `?` or `[]`
   - ex. `String`, `Boolean?`, `Number[]`, `Roles`, ..
 - `[..property attributes]` - an attribute phrase 
   - **Optional**
   - matching `^@[a-z](\.?[a-z0-9_]+)*$` if resolving to `true`
   - matching `^@[a-z](\.?[a-z0-9_]+)*\([^\)]\)$` if a function accepting 
     the following:
     - `[name]` - An prop name reference
     - Strings denoted with quotes like `"foo"`
     - Other scalars including number, boolean, null
   - ex. `@label("Address", "Addresses") @searchable @field.input(Text)`

With the specifications above the following examples are valid syntax.

### 1.1. Prop

A prop is a variable that can be defined and referenced within props 
and attributes. The following are valid prop definitions.

```js
prop Input { type "text" placeholder null hidden false }

prop Shirts { sizes ["xl" "sm" "md"] price 100.50 }

prop Price { min 0 max 100 step 0.01 }

props Countries {
  options [
    { label "United States" value "US" }
    { label "Mexico" value "MX" }
    { label "Canada" value "CA" }
  ]
}

model User {
  name String @field.input(Input)
  ...
}
```

> In Exma we only use double quotes.

> In Exma we removed the need to add colons and commas.

Props cannot be used as property types. The following is invalid.

```js
prop Input { type "text" placeholder null hidden false }

model User {
  name Input
}
```

### 1.2. Enum

Unlike a prop, an enum can be used as a property type

```js
enum Roles {
  ADMIN "admin"
  MANAGER "manager"
  USER "user"
}

model User {
  roles Roles
}
```

### 1.3. Type

A composite type is used to define specifics of a JSON column in a model.

```js
type Address @label("Address", "Addresses") {
  street  string    @field.input(Text) @is.required @list.hide
  city    string    @field.input(Text) @is.required
  country string    @field.select(Countries) @is.option(Countries) @view.text(Uppercase)
  postal  string    @field.input(Text) @is.required
}
```

> Attributes in both types and models are free form, meaning you can 
arbitrarily make up attributes. Each generator should provide which 
attributes it uses however.

### 1.4. Model

A model is a representation of a database table or collection. 
It uses props and types.

```js
model User @label("User" "Users") {
  id       string       @label("ID")         @id @default("nanoid(20)")
  username string       @label("Username")   @searchable @field.input(Text) @is.required
  password string       @label("Password")   @field.password @is.required @list.hide @view.hide
  role     Roles        @label("Role")       @filterable @field.select @list.text(Uppercase) @view.text(Uppercase)
  address  Address?     @label("Address")    @list.hide
  age      number       @label("Age")        @unsigned @filterable @sortable @field.number(Age) @is.gt(0) @is.lt(150)
  salary   number       @label("Salary")     @insigned @filterable @sortable @field.number(Price) @list.number @view.number
  balance  number       @label("Balance")    @filterable @sortable @field.number() @list.number() @view.number
  bio      text         @label("Bio")        @field.markdown
  active   boolean      @label("Active")     @default(true) @filterable @field.switch @list.yesno @view.yesno
  created  Date         @label("Created")    @default("now()") @filterable @sortable @list.date(Pretty)
  updated  Date         @label("Updated")    @default("updated()") @filterable @sortable @list.date(Pretty)
  company  Company?     @label("My Company") 
}
```