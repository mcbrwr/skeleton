# Skeleton

Use skeleton files for components to provide a consistent architecture.

WARNING: This script modifies files and is in experimental alpha stage, use at your own risk.

## Installing

```bash
yarn add -d @mcbrwr/skeleton

# or

npm install -D @mcbrwr/skeleton
```

Then add the following to your `package.json`:

```json
{
  "scripts": {
    "skeleton": "skeleton"
  }
}
```

To initialize a demo `.skeleton` dir with example files for a next project with storybook stories, run:

```bash
yarn skeleton examples
```

## Customizing

Create the dir `.skeleton` and add a dir with the name of an alias you want to use. ie you can create `.skeleton/component` and the command `yarn skeleton component MyComponent` will create a new skeleton with `.skeleton/component` as source, the destination dir in `.skeleton/component/config.json` and outputs it there as `desinationDir/MyComponent/...`.
