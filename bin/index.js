#! /usr/bin/env node
const Handlebars = require("handlebars");
const fs = require("fs");
const pathLib = require("path");
const argv = process.argv;
// const recursiveCopy = require("recursive-copy");

function copyFileSync(source, target) {
  var targetFile = target;

  // If target is a directory, a new file with the same name will be created
  if (fs.existsSync(target)) {
    if (fs.lstatSync(target).isDirectory()) {
      targetFile = pathLib.join(target, pathLib.basename(source));
    }
  }

  fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function copyFolderRecursiveSync(source, target) {
  var files = [];

  // Check if folder needs to be created or integrated
  var targetFolder = pathLib.join(target, pathLib.basename(source));
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder);
  }

  // Copy
  if (fs.lstatSync(source).isDirectory()) {
    files = fs.readdirSync(source);
    files.forEach(function (file) {
      var curSource = pathLib.join(source, file);
      console.log(curSource, targetFolder);
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, targetFolder);
      } else {
        copyFileSync(curSource, targetFolder);
      }
    });
  }
}

// install examples when requested
if (argv[2] === "examples") {
  const src = __dirname + "/../.skeleton";
  const dst = process.cwd();
  // process.exit(1);
  if (fs?.existsSync(dst)) {
    console.log(
      "❌ Skeleton already exists. Not overwriting, move it out of the way to install the examples."
    );
    process.exit(1);
  }

  copyFolderRecursiveSync(src, dst);

  console.log(
    'Done! Run "skeleton component MyComponentName" to create a component, or "skeleton template MyTemplateName" to setup a template.'
  );
  // exit the script
  process.exit(0);
}

// run the skeleton script

const dirList = (source) =>
  fs
    .readdirSync(source, {
      withFileTypes: true,
    })
    .reduce((a, c) => {
      c.isDirectory() && a.push(c.name);
      return a;
    }, []);

const componentType = argv[2];
const skeletonTypes = dirList(`.skeleton`);
const figmaUrl = argv[4] ? argv[4] : "";

// if component type is not in array, exit
if (!skeletonTypes.includes(componentType)) {
  console.error(
    `Invalid component type: ${componentType}, must be one of: ${skeletonTypes.join(
      ", "
    )}`
  );
  process.exit(1);
}
let path = argv[3]; // todo: sanity check

// pop the name from the path and upppercase the first char
let name = path;
if (path?.indexOf("/") > -1) {
  path = path.split("/");
  name = path.pop();
  path = path.join("/") + "/" + name.charAt(0).toUpperCase() + name.slice(1);
}

// ucfirst
name = name?.charAt(0).toUpperCase() + name?.slice(1);

// read the config
const skeletonDir = ".skeleton/" + componentType;
const defaults = { section: "Components", path: "components" };
let config = JSON.parse(fs?.readFileSync(skeletonDir + "/config.json"));
config = Object.assign(defaults, config);

// add config path
path = config?.path ? config.path + "/" + path : path;

console.log(
  "Creating skeleton files for " +
    name +
    " in " +
    path +
    "with figma url " +
    figmaUrl
);

// if dir exists, exit
if (fs?.existsSync(path)) {
  fs.readdir(path, (err, files) => {
    if (err) {
      console.error("Error reading directory: " + err);
      process.exit(1);
    } else if (files.length) {
      console.log("Directory not empty, exiting");
      process.exit(1);
    }
  });
}

// create the dir
fs?.mkdirSync(path, { recursive: true });

// check if root dir exists
if (!fs?.existsSync(skeletonDir)) {
  console.log("Skeleton directory " + skeletonDir + " does not exist, exiting");
  process.exit(1);
}

// read the skeleton files and compile them
const files = fs?.readdirSync(skeletonDir);
const skipFiles = ["config.json"];
// read files and compile them with handlebars
files?.forEach((file) => {
  // if file in skipFiles, continue
  if (skipFiles.includes(file)) return;
  // setup the new name
  let newFile = file.replace(/\{name\}/, name);
  newFile = newFile.replace(/.handlebars/, "");
  // skip if file exists
  const outputPath = path + "/" + newFile;
  if (fs.existsSync(outputPath)) {
    console.log("Skipping " + outputPath + " as it already exists");
    return;
  }
  // read the file
  const filePath = skeletonDir + "/" + file;
  const fileContents = fs.readFileSync(filePath, "utf8");
  const template = Handlebars.compile(fileContents);
  const output = template({
    name: name,
    nameInBrackets: "{" + name + "}",
    dataName: "{" + name + "Data}",
    type: componentType,
    section: config.section,
    figmaDoc: figmaUrl.split("=")[0],
    figmaNode: figmaUrl.split("=")[1],
  });
  fs.writeFileSync(outputPath, output);
  console.log("🛠  created " + outputPath);
});
