# exma-typescript

Official typescript generator using exma schema files

## Install

```bash
yarn add -D exma-typescript

... or ...

npm i --dev exma-typescript
```

## Usage

In your `schema.exma` file add the following generator.

```js
generator "exma-typescript" {
  ts true
  output "./src/types.ts"
}
```

Options
 - `ts` - whether to generate the typescript file or the final `*.d.ts`
 - `output` - where to generate the typescript

For example the following `schema.exma` and the generated `src/types.ts`.

```js
generator "exma-typescript" {
  ts true
  output "./src/types.ts"
}

enum Roles {
  ADMIN   "ADMIN"
  MANAGER "MANAGER"
  USER    "USER"
}

prop RoleProps {
  options [
    { label "Admin" value "ADMIN" }
    { label "Manager" value "MANAGER" }
    { label "User" value "USER" }
  ]
}

type Address @label("Address" "Addresses") {
  street  String    @field.text @list.hide
  city    String?   @field.text
  country String    @field.country @list.uppercase @view.uppercase
  postal  String    @field.text
}

model User @label("User" "Users") {
  id        String   @label("ID")         @db.char(21) @id @default("cuid()")
  username  String   @label("Username")   @db.varchar(255) @unique @searchable             @field.text
  companyId String?  @label("Company")    @db.char(21) @relation("Company" "id" "name")    @field.modelcomplete("Company" "id" "name") 
  name      String   @label("Name")       @db.varchar(255) @searchable                     @field.text
  role      Roles    @label("Role")       @db.varchar(255) @default("USER") @filterable    @field.select(RoleProps) @list.lowercase @view.lowercase
  active    Boolean  @label("Active")     @default(true) @filterable                       @field.switch @list.yesno @view.yesno
  lastLogin Datetime @label("Last Login") @default("now()")                                @list.date
  created   Datetime @label("Created")    @default("now()") @filterable @sortable          @list.date
  updated   Datetime @label("Updated")    @default("now()") @updated @filterable @sortable @list.date
}

model Company @label("Company" "Companies") {
  id         String   @label("ID")         @db.char(21) @id @default("cuid()")
  name       String   @label("Name")       @db.varchar(255) @unique @searchable             @field.text
  country    String   @label("Country")    @db.char(2) @filterable                          @field.country
  address    Address  @label("Address")                                                     @field.fieldset("Address" false) @list.hide @view.table
  contact    String?  @label("Contact")    @db.varchar(255)                                 @field.text
  email      String?  @label("Email")      @db.varchar(255)                                 @field.email @list.email @view.email
  phone      String?  @label("Phone")      @db.varchar(255)                                 @field.phone @list.phone @view.phone
  files      String[] @label("Files")                                                       @field.filelist @list.hide @view.line
  references Hash?    @label("References")                                                  @field.metadata @list.hide @view.metadata
  supplier   Boolean  @label("Supplier")   @default(false)                                  @field.switch @list.yesno @view.yesno
  approved   Boolean  @label("Approved")   @default(false)                                  @field.switch @list.yesno @view.yesno
  active     Boolean  @label("Active")     @default(true) @filterable                       @field.switch @list.yesno @view.yesno
  created    Datetime @label("Created")    @default("now()") @filterable @sortable          @list.date
  updated    Datetime @label("Updated")    @default("now()") @updated @filterable @sortable @list.date
}
```

The above example `schema.exma` would generate the following types in `src/types.ts`.

```ts
export enum Roles {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  USER = "USER"
};

export type Address = {
  street: string
  city?: string
  country: string
  postal: string
};

export type User = {
  id: string
  username: string
  companyId?: string
  name: string
  role: Roles
  active: boolean
  lastLogin: Date
  created: Date
  updated: Date
};

export type UserExtended = User & {
  company?: Company
};

export type Company = {
  id: string
  name: string
  country: string
  address: Address
  contact?: string
  email?: string
  phone?: string
  files: string[]
  references?: Record<string, string|number|boolean>
  supplier: boolean
  approved: boolean
  active: boolean
  created: Date
  updated: Date
};
```