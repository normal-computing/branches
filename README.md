<div align="center">
  <h1 align="center">BrainBranch</h1>
  <p align="center">
    A Graph-based LLM power tool for visualizing and interacting with tree-search algorithms like Tree-of-Thoughts.
    <br />
    <br />
    <a href="http://code-gen-tree.vercel.app">Try Online</a>
    ·
    <a href="https://github.com/normal-computing/BrainBranch/issues">Report a Bug</a>
  </p>
</div>

<br />

![A demo of code-gen with reflexion.](https://storage.googleapis.com/normal-blog-artifacts/systerm2/tot_demo.gif)

## About

BrainBranch, forked from [Flux](https://github.com/paradigmxyz/flux), is a power tool for visualizing tree-search algorithms like Tree-of-Thoughts.

In this example, we visualize code-generation as a tree-search for finding solutions to Python programs in the HumanEval benchmark. Generated code that fails to compile or pass tests, is reflected upon through its error traceback to generate a reasoning chain and self-correct. 


## Usage

Visit [code-gen-tree.vercel.app](https://code-gen-tree.vercel.app) to try our hosted BrainBranch online or follow the instructions below to run it locally.

## Running Locally

```sh
git clone https://github.com/normal-computing/BrainBranch.git
npm install
npm run dev
```

## Contributing

We are happy to receive contributions and feedback to BrainBranch! Please create an issue [here](https://github.com/normal-computing/BrainBranch/issues).
