# frontend2js

Intended to analyse an entire frontend project with AST, this package will make a copy of project's folder, without any non-js file, except HTML files. These will be transformed into ".html.js" files:

Input

```html
<!-- index.html -->
<script src="./index.js"></script>
<script>
  var x = 2
</script>
```

Output

```js
/* index.html.js */
import './index.js'

var x = 2
```

This allows creating entry points for the js files

## Usage

```shell
npm install frontend2js
```

Include

```
frontend2js "inputFolder" "destFolder"
```

## API


