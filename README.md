# Struffer
Struct + Buffer = Struffer
Also works with Uint8Arrays

Because Buffers (and Uint8Arrays) are great, but manipulating data with them is highly 
unconfortable. Struffers overlay a structure definition (that you provide) to easily
interact with data in Buffers via members.

## Install

As simple as 1, 2, 3:

```bash
npm install --save struffer
```

## API

Struffers come in two flavors: normal and advanced. Both share the same exact API and are
almost identical. The only difference is normal struffers require members to be sized
in multiples of eight (8, 16, 32, etc.) while advanced struffers allow members to be
arbitrary bit sizes (3, 17, 22, etc.). Advanced struffers are recommended if you're looking
to cut down on size and know the exact limit of the values you'll be using. Normal struffers 
are recommended for pretty much everything else (since they enforce standard bit sizes).

```ts
// pick your poison
import Struffer, { AdvancedStruffer } from 'struffer';
```

TODO. document more stuff. sorry.
