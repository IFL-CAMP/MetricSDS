# MetricSDS
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.3.1. The github.io page is in this [link](https://ifl-camp.github.io/MetricSDS/)

This project is based on the work from Clément Playout et al. [Link](https://clementpla.github.io/SegmentationMetricTutorial/welcome)

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

# Deploy (to Github-Pages)

Install the deployment package  ```npm i angular-cli-ghpages --save-dev``` 

Run ```ng build --configuration production --base-href "https://ifl-camp.github.io/MetricSDS/" ``` and configure the sources to the github hosting repository.

Run ```npx angular-cli-ghpages --dir=dist/metric-tutorial``` to push the sources on the ```gh-pages``` branch of the repository.

# Surgical Phase Recognition Metrics

[Metric guidelines for this project](src/docs/README.md)