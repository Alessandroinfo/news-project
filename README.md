# NewsProject


## Getting Started

To get you started you can simply clone the NewsProject repository and install the dependencies:

### Prerequisites

You need git to clone the NewsProject repository. You can get git from
[http://git-scm.com/](http://git-scm.com/).

We also use a number of node.js tools to initialize and test NewsProject. You must have node.js and
its package manager (npm) installed.  You can get them from [http://nodejs.org/](http://nodejs.org/).

### Clone NewsProject

Clone the NewsProject repository using [git][git]:

```
git clone https://github.com/angular/NewsProject.git
cd NewsProject
```

If you just want to start a new project without the NewsProject commit history then you can do:

```bash
git clone --depth=1 https://github.com/angular/NewsProject.git <your-project-name>
```

The `depth=1` tells git to only pull down one commit worth of historical data.

### Install Dependencies

We have two kinds of dependencies in this project: tools and angular framework code.  The tools help
us manage and test the application.

* We get the tools we depend upon via `npm`, the [node package manager][npm].
* We get the angular code via `bower`, a [client-side code package manager][bower].

We have preconfigured `npm` to automatically run `bower` so we can simply do:

```
npm install
```

Behind the scenes this will also call `bower install`.  You should find that you have two new
folders in your project.

* `node_modules` - contains the npm packages for the tools we need
* `app/bower_components` - contains the angular framework files

*Note that the `bower_components` folder would normally be installed in the root folder but
NewsProject changes this location through the `.bowerrc` file.  Putting it in the app folder makes
it easier to serve the files by a webserver.*

### Run the Application

We have preconfigured the project with a simple development web server.  The simplest way to start
this server is:

```
npm start
```



Caro Alessandro,

l'esame consiste nella realizzazione di una Web Application. Dovresti gestire sia il front-end che il back-end. Le tecnologie raccomandata sono HTML5, JQuery, Angukar e un DBMS a tua scelta. Sarebbe bello inoltre usare un CSS responsive quale Twitter Bootstrap.

Ciao,

P
