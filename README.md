# DataYoga Lineage

This package allows to generate documentation of data pipelines and data lineage charts. It is source agnostic and uses a predefined json/yaml format to represent the dependencies and business logic. The resulting markdown files can be used standalone or as part of a documentation site using tools like [MkDocs](https://www.mkdocs.org/) or [VuePress](https://vuepress.vuejs.org/).

![image](https://github.com/datayoga-io/lineage/blob/main/example/output/pipelines/order_mgmt/load_orders/dependencies.png?raw=true)

# Installation

```
npm install -g @datayoga-io/lineage
```

# Quick Start

To quickly get started with Lineage, scaffold a new project. This will create the folder structure along with sample files.

```
dy-lineage scaffold ./my-project
```

To generate the documentation for the new project:

```
dy-lineage build ./my-project --dest ./docs
```

# Data Entities

Lineage models the data ecosystem using the following entities:

`Datastore` - A datastore represents a source or target of data that can hold data at rest or data in motion. Datastores include entities such as a table in a database, a file, or a stream in Kafka. A Datastore can act either as a source or a target of a pipeline.

`File` - A file is a type of Datastore that represents information stored in files. Files contain metadata about their structure and schema.

`Dimension` - A dimension table / file is typically used for lookup and constant information that is managed as part of the application code. This often includes lookup values such as country codes.

`Runner` - A runner is a processing engine capable of running data operations. Every Runner supports one or more programming languages. Some Runners, like a database engine, only support SQL, while others like Spark may support Python, Scala, and Java.

`Consumer` - A consumer consumes data and presents it to a user. Consumers include reports, dashboards, and interactive applications.

`Pipeline` - A pipeline represents a series of `Jobs` that operate on a single `Runner`.

`Job` - A job is composed of a series of Steps that fetch information from one or more Datastores, transform them, and store the result in a target Datastore, or perform actions such as sending out alerts or performing HTTP calls.

`Job Step` - Every step in a job performs a single action. A step can be of a certain _type_ representing the action it performs. A step can be an SQL statement, a Python statement, or a callout to a library. Steps can be chained to create a Directed Acyclic Graph (DAG).

# Getting started

# Usage

```
dy-lineage <input folder> -dest <output folder>
```

Lineage will scan the file(s) specified in input and attempt to load information about the catalog. In addition, a folder containing yaml files describing each pipeline's business logic can be provided.

See the [Example](./example) folder for sample input files and generated output files

## Structure of input folder

```
.
├── .dyrc
├── datastores
├── files
├── pipelines
├── relations
```

- `.dyrc`: Used to store global configuration.
- `datastores`: Catalog file(s) with information about datastore entities and their metadata
- `files`: Catalog file(s) with information about file datastore entities and their metadata
- `pipelines`: Optional files containing information about the pipelines and business logic flow
- `relations`: Information about the relations between the data entities

## Structure of catalog file

The catalog file contains the entity definition and metadata for each of the entities.
The node naming convention is: `<entity type>`:`<optional module name>`.`<entity name>`. Module name can be nested: e.g. `order_mgmt.weekdays.inbound.load_orders`

Example:

```yml
pipeline:order_mgmt.load_orders:
datastore:orders:
datastore:raw_orders:
```

## Structure of relations file

The relations file holds the relationships between the entities.

Example:

```yml
- source: datastore:raw_orders
  target: pipeline:order_mgmt.load_orders
- source: pipeline:order_mgmt.load_orders
  target: datastore:orders
```

## Adding metadata and business logic flow to pipelines

TBD

# Lineage collectors

Lineage collectors enable to export lineage knowlege from external systems to be processed and documented.

Coming soon

## Informatica

## Database data dictionary

## Tableau
