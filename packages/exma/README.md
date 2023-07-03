# Exma

A schema file formatting standard used to define properties of data 
collections. Originally, schema files are currently used to define 
database structures. This file format builds on top of that adding 
arbitrary attributes for fields, validation, formats etc. so plugins
are more informed to produce more accurate and relevant code. 

## Install

```bash
$ npm i -D exma
```

## 1. Usage

```bash
$ npx exma -i ./schema.exma
```

In your root project, craete a file called `schema.exma` and paste the 
following.

```js
plugin "./make-sql" {
  engine "mysql"
}

prop Text { type "text" }
prop Uppercase { format "uppercase" }
prop Pretty { format "pretty" }
prop Age { min 0 max 110 }
prop Price { min 0 }

enum Roles {
  ADMIN "Admin"
  MANAGER "Manager"
  USER "User"
}

type Address @label("Address" "Addresses") {
  street  String    @field.input(Text) @is.required @list.hide
  city    String?   @field.input(Text) @is.required
  country String    @field.select(Countries) @list.text(Uppercase) @view.text(Uppercase)
  postal  String    @field.input(Text) @is.required
}

model User @label("User" "Users") {
  id       String       @label("ID")         @id @default("nanoid(20)")
  username String       @label("Username")   @searchable @field.input(Text) @is.required
  password String       @label("Password")   @field.password @is.clt(80) @is.cgt(8) @is.required @list.hide @view.hide
  role     Roles        @label("Role")       @filterable @field.select @list.text(Uppercase) @view.text(Uppercase)
  address  Address?     @label("Address")    @list.hide
  age      Number       @label("Age")        @unsigned @filterable @sortable @field.number(Age) @is.gt(0) @is.lt(150)
  salary   Number       @label("Salary")     @insigned @filterable @sortable @field.number(Price) @list.number @view.number
  balance  Number[]     @label("Balance")    @filterable @sortable @field.number() @list.number() @view.number
  bio      Text         @label("Bio")        @field.markdown
  active   Boolean      @label("Active")     @default(true) @filterable @field.switch @list.yesno @view.yesno
  created  Date         @label("Created")    @default("now()") @filterable @sortable @list.date(Pretty)
  updated  Date         @label("Updated")    @default("updated()") @filterable @sortable @list.date(Pretty)
  company  Company?     @label("My Company") 
}
```

Create a file called `make-sql.js` and paste the following.

```js
module.exports = ({ config, schema, cli }) => {
  cli.terminal.warning('TODO make SQL');
};
```

For Typescript you can do the following

```ts
import type { PluginProps } from 'exma';

export default function makeSql({ config, schema, cli }: PluginProps) {
  cli.terminal.warning('TODO make SQL');
};
```

Next run the following in your project root and wait for the output.

```bash
$ npx exma
```

## 2. Specifications

The primary purpose of this specifications is to provide a simple and 
flexible syntax that any plugin can use as a basis to render code. 
At this point, Exma does not care how plugins use the final 
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

### 2.1. Prop

A prop is a variable that can be defined and referenced in other props 
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

### 2.2. Enum

Unlike a prop, an enum can be used as a property type.

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

### 2.3. Type

A composite type is used to define specifics of a JSON column in a model.

```js
type Address @label("Address", "Addresses") {
  street  String    @field.input(Input) @is.required @list.hide
  city    String    @field.input(Input) @is.required
  country String    @field.select(Countries) @is.option(Countries) @view.text(Uppercase)
  postal  String    @field.input(Input) @is.required
}
```

> Attributes in both types and models are free form, meaning you can 
arbitrarily make up attributes. Each plugin should provide which 
attributes it uses however.

### 2.4. Model

A model is a representation of a database table or collection. 
It uses props and types.

```js
model User @label("User" "Users") {
  id       String       @label("ID")         @id @default("nanoid(20)")
  username String       @label("Username")   @searchable @field.input(Input) @is.required
  password String       @label("Password")   @field.password @is.required @list.hide @view.hide
  role     Roles        @label("Role")       @filterable @field.select @list.text(Uppercase) @view.text(Uppercase)
  address  Address?     @label("Address")    @list.hide
  age      Number       @label("Age")        @unsigned @filterable @sortable @field.number(Age) @is.gt(0) @is.lt(150)
  salary   Number       @label("Salary")     @insigned @filterable @sortable @field.number(Price) @list.number @view.number
  balance  Number       @label("Balance")    @filterable @sortable @field.number() @list.number() @view.number
  bio      Text         @label("Bio")        @field.markdown
  active   Boolean      @label("Active")     @default(true) @filterable @field.switch @list.yesno @view.yesno
  created  Date         @label("Created")    @default("now()") @filterable @sortable @list.date(Pretty)
  updated  Date         @label("Updated")    @default("updated()") @filterable @sortable @list.date(Pretty)
  company  Company?     @label("My Company") 
}
```

## 3. Contributing

Thanks for being an awesome developer! We are always looking for 
contributors and sponsors. If your interested, 
[contact us](https://github.com/OSSPhilippines) so we can discuss. 
Clone this repo and run the following commands in the project folder.

```js
$ yarn
$ yarn build
$ yarn test
```

The projects in this monorepo are the following.

1. `@exma/parser` - Parses a schema file to AST
2. `@exma/language` - A language server used by vscode/vim to read 
   from `.exma` files and check for syntax errors and to enable 
   intellisense for the file type.
3. `@exma/generator` - A programmatical command line interface used 
   by projects and that calls on external plugins to make relevant 
   code (like SQL schema, GraphQL, react components, etc.)
4. `exma` - A stand alone command line tool used that calls on 
   external plugins to make relevant code (like SQL schema, GraphQL, 
   react components, etc.) 

Please follow the steps below to properly contribute to this repository.

> Do not commit code that is not related to a GitHub issue!

> Please tag all your commits with `[type]/[issue#]`.

> Please include the time it took per commit. ie. `1s` or `1h`.

 1. Per issue on Github, you should create a branch. example: `[type]/[issue#]`
    - Per feature you should create a feature branch. ie. `feature/1001`.
    - Per bug you should create a fix branch. ie. `fix/1002`.
    - Per task you should create a task branch. ie. `task/1003`
 2. Commits need to reference the issue that is being worked on. example: `updated copy #1004` or `fixes #1005`
    - It's also good to to add the amount of time to your commit message. example: `fixed button #1006 30m` or `built awsome feature #1007 16h`
 3. When you are finished with your branch, you should create a pull request back to the `main` branch.
    - Assign another developer to review your code. 
    - All contributors are expected to both write and review code. 
    - Ask [Dev lead](https://github.com/cblanquera) for assignments.