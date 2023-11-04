<div align="center">
  <h1 align="center">BrainBranch</h1>
  <p align="center">
    A graph-based LLM power tool (forked from <a href="https://github.com/paradigmxyz/flux">Flux</a>) for visualizing and interacting with tree-search algorithms like Tree of Thoughts.
    <br />
    <br />
    <a href="http://code-gen-tree.vercel.app">Try Online</a>
    ·
    <a href="https://github.com/normal-computing/BrainBranch/issues">Report a Bug</a>
  </p>
</div>

<br />

![BrainBranch in action: Tree-search visualization for code generation with self-correction in the HumanEval benchmark](https://storage.googleapis.com/normal-blog-artifacts/systerm2/tot_demo.gif)

*The GIF above demonstrates BrainBranch's tree-search visualization during code generation. It shows how the system automatically corrects itself by analyzing error tracebacks to refine its solutions to Python programming problems from the HumanEval dataset.*

## About

BrainBranch, forked from [Flux](https://github.com/paradigmxyz/flux), is an advanced tool for visualizing and shaping the decision-making of large language models (LLMs) through tree-search algorithms like Tree of Thoughts. Designed for researchers and developers, it allows users to directly interact with AI reasoning processes, streamlining the exploration of complex coding challenges and strategic problem-solving.

### Code Generation (HumanEval)
BrainBranch automatically expands decision trees to solve programming problems from the [HumanEval dataset](https://huggingface.co/datasets/openai_humaneval), visualizing reasoning chains and facilitating self-correction through error tracebacks. This is found on the `main` branch and is currently hosted. 

### Game of 24
BrainBranch includes a specialized evaluation mechanism for the [Game of 24 puzzle](https://en.wikipedia.org/wiki/24_(puzzle)), leveraging a scoring system to enhance breadth-first search (BFS) by prioritizing promising paths. This is found on the `game-of-24` branch.

## Core Technical Features

- 🌳 **Automated Tree Expansion**: Leveraging Tree of Thoughts for dynamic expansion in problem-solving.
- 🧠 **Pre-loaded Prompts**: Curated for search-based reasoning to solve specific problems.
- 💻 **Code Interpretation**: Instant execution and error analysis for self-correcting AI-generated code.
- 🔍 **Scoring Mechanism**: Advanced BFS for the Game of 24 with node evaluation for search optimization.
- 📊 **Interactive Visualization**: Graphical representation of tree searches for easy analysis and education. Thank you to [Flux](https://github.com/paradigmxyz/flux) for this.

## Usage

To get started with BrainBranch, you can either visit [code-gen-tree.vercel.app](https://code-gen-tree.vercel.app) for the hosted version or run it locally by following the instructions below.

## Running Locally

**Frontend (User Interface):**

```sh
git clone https://github.com/normal-computing/BrainBranch.git
npm install
npm run dev
```

**Backend (Code Interpreter):**

```sh
cd api
pip install -r requirements.txt
python execute.py
```

## What's Next: Features to Come

Our commitment to enhancing BrainBranch continues, with exciting new developments on the way:

- **Implement Node Value Editing and Regenerate Subtree Functionality**: [Issue #5](https://github.com/normal-computing/BrainBranch/issues/5).

- **Fix UI Color Inconsistencies and Implement Customization Features**: [Issue #6](https://github.com/normal-computing/BrainBranch/issues/6).

- **Address Model/UI Timeout Issues**: [Issue #7](https://github.com/normal-computing/BrainBranch/issues/7).

- **Enhance Game of 24 Logic, Model Cost Tracking, and Prompt Engineering**: [Issue #8](https://github.com/normal-computing/BrainBranch/issues/8).

## Contributing

Your contributions make BrainBranch better. Whether it’s bug reports, new features, or feedback, we welcome it all! Report bugs or request features by creating an issue [here](https://github.com/normal-computing/BrainBranch/issues).

## License

BrainBranch is open-source and continues to uphold the MIT license as its predecessor, Flux.