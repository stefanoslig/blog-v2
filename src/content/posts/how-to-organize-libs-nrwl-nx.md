---
title: "How to organize your libs in a nrwl/nx monorepo"
description: "In this article you can find a real world example and a short explanation of how you can organize the libs in an Angular nrwl/nx monorepo"
image: "/assets/blog/organize-your-libs-in-nx-monorepo/building-blocks.jpeg"
date: 2022-04-22T05:35:07.322Z
authors: ["Stefanos Lignos"]
categories: ["Angular"]
tags: ["Angular", "nrwl/nx"]
draft: false
---

In this article you can find a real world example and a short explanation of how you can organize the libs in an Angular nrwl/nx monorepo. You can find the code on the following [Github](https://github.com/stefanoslig/organize-nx-libs-article-demo) repository.

In this project, there is one app (learning-tube) which consumes the libraries under the libs folder.

### Folder structure

```
libs
    > learnings
        > data-access
        > feature-list
        > feature-search
        > shell
        > model
        > utils-testing
    > shared
        > data-access
        > ui
        > model
    > users
        > data-access
        > feature-list
        > feature-search
        > shell
        > model
        > utils-testing
```

### Tag in Multiple Dimensions

I used two classifiers to name my libraries. The first classifier is the **scope** and the second the **type**. The main reason is that I want every developer when he looks at a library to understand **where** this library can be used and **which** kind of services/components/etc it contains.

#### Scope classifier

The **scope** is the section (domain) of the app the library can be used for. In this project, the scope is a section of the app since I have only one app. In a repository with more than one apps, the scope can be each one of these apps. The **scope** gives a clear indication that a feature belongs to a specific domain. For example the libraries under the **learnings** scope, are used in the learnings page, the libraries under the **users** scope in the users page and the libraries under the **shared** scope can be reused between all the sections of the app.

#### Type classifier

The **type** indicates the purpose of a library. I have used 6 different types (feature, data-access, ui, feature-shell, utils, model). 

##### Feature layer

The **feature-...** type contains smart components. These are components which enable the communication with the data-sources (most likely they inject api services). 

##### Data Access layer

The **data-access** type contains code for interacting with the server. An example from the **users-data-access** library is:

```
users
    > data-access
        > learnings-api.service
        > learnings-store.service
```

##### UI layer

The **ui** type contains dumb (presentational) components. These components are reusable in the scope of this library. In this project we have a **ui** library only in the shared folder. The components of this library can be used with every other library. However, we could also have domain specific presentational components. In this case, the **ui** library would be under the **learnings** or **users** scope and could be used only in the libraries that belong to this domain.

##### Shell layer

The **shell** is the glue between the **feature-...** libs. It is responsible for combining different features into a shell component, which is lazy-loaded via the application's routes. Alternatively, it can export a route configuration that is lazy-loaded from the application's route configuration. In this project, the shell libraries export a route configuration  ([example in repo](https://github.com/stefanoslig/organize-nx-libs-article-demo/blob/master/libs/learnings/shell/src/lib/learnings-shell.routes.ts)), which are lazy loaded from the [application](https://github.com/stefanoslig/organize-nx-libs-article-demo/blob/master/apps/learning-webapp/src/app/app.routes.ts). 

##### Utils layer

The **utils** libraries are used in this case to keep some mock data and services for the testing. Generally they contain low level code used by all the other libraries in the same scope.

##### Model layer

The **model** libraries contain (shared) domain models. It might contain interfaces, types, enums, DTOs, entities, etc.

That was just one example of how you can organize libraries in an Nrwl/Nx monorepo. Of course, every team can define their own structure and library types based on their specific needs. I hope you found this example helpful!
