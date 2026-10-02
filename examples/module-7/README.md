# Module 7 Compact source

This directory contains the canonical complete Compact artifact for Module 7. It covers protected-register eligibility and a single-use nullifier. Vote commitments and tally integration are intentionally out of scope because their exact API is not documented here.

## Intended toolchain

- Compact compiler: `0.31.1`
- Compact language pragma: `0.23`
- Proof server: `8.1.0`

Install or select the compiler version:

```bash
compact update 0.31.1
```

Compile from the repository root into a local output directory:

```bash
compact compile examples/module-7/private-voting.compact examples/module-7/build
```

If proof generation is needed, the intended proof-server image is:

```bash
docker run -p 6300:6300 midnightntwrk/proof-server:8.1.0 midnight-proof-server -v
```

**Verification status:** This environment has not compiled `private-voting.compact`; successful compilation is not claimed.
