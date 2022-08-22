LICENSE_INFO="SPDX-License-Identifier"

./node_modules/.bin/truffle-flattener contracts/GenesisAvatar.sol | grep -v "// File" | grep -v "$LICENSE_INFO" > flattened/GenesisAvatar.sol
