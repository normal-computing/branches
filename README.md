<div align="center">

<img src="./docs/source/_static/logo.png" alt="Branches Logo" width=200></img>

# Branches

Prototype advanced LLM algorithms for reasoning and planning.

[Try Online](http://code-gen-tree.vercel.app) •
[Report a Bug](https://github.com/normal-computing/Branches/issues) •
[Stay tuned](#stay-tuned-for)

</div>

![Branches in action: Tree-search visualization for code generation with self-correction in the HumanEval benchmark](https://storage.googleapis.com/normal-blog-artifacts/systerm2/tot_demo.gif)

***Branches tree-search visualization during code generation.** We visualize a reasoning algorihm which learns from feedback, automatically correcting itself by analyzing error tracebacks to refine its solutions. In this case, we benchmark Python programming problems from the HumanEval dataset.*

## About

Branches is an AI tool for graph-based prototyping of advanced algorithms for LLM reasoning and planning. Like Tree of Thoughts with Reflexion. Branches is adapted from [Flux](https://github.com/paradigmxyz/flux).

Designed for researchers and developers, it allows users to directly interact with AI reasoning processes, streamlining the exploration of complex coding challenges and strategic problem-solving.

### Code Generation (HumanEval)

Branches automatically expands decision trees to solve programming problems from the [HumanEval dataset](https://huggingface.co/datasets/openai_humaneval), visualizing reasoning chains and facilitating self-correction through error tracebacks. This is found on the `main` Branches and is currently hosted. 

### Game of 24
Branches includes a specialized evaluation mechanism for the [Game of 24 puzzle](https://en.wikipedia.org/wiki/24_(puzzle)), leveraging a scoring system to enhance breadth-first search (BFS) by prioritizing promising paths. This is found on the `game-of-24` Branches.

## Features

- [x] 🌳 **Automated Tree Expansion**: Leveraging Tree of Thoughts for dynamic expansion in problem-solving.
- [x] 🧠 **Pre-loaded Prompts**: Curated for search-based reasoning to solve specific problems.
- [x] 💻 **Code Interpretation**: Instant execution and error analysis for self-correcting AI-generated code.
- [x] 🔍 **Scoring Mechanism**: Advanced BFS for the Game of 24 with node evaluation for search optimization.
- [x] 📊 **Interactive Visualization**: Graphical representation of tree searches for easy analysis and education. Largely adapted from [Flux](https://github.com/paradigmxyz/flux).

## Usage

To get started with Branches, you can either visit [code-gen-tree.vercel.app](https://code-gen-tree.vercel.app) for the hosted version or run it locally by following the instructions below.

## Running Locally

**Frontend (User Interface):**

```sh
git clone https://github.com/normal-computing/Branches.git
npm install
npm run dev
```

**Backend (Code Interpreter):**

```sh
cd api
pip install -r requirements.txt
python execute.py
```

## Stay Tuned For

Our commitment to enhancing Branches continues, with exciting new developments on the way:

- Node Value Editing and Regenerate Subtree Functionality ([#5](https://github.com/normal-computing/Branches/issues/5))

- UI Color Fixes and Customization Features ([#6](https://github.com/normal-computing/Branches/issues/6))

- Address Model/UI Timeout Issues ([#7](https://github.com/normal-computing/Branches/issues/7))

- Enhance Game of 24 Logic, Model Cost Tracking, and Prompt Engineering ([#8](https://github.com/normal-computing/Branches/issues/8))

## Contributing

Your contributions make Branches better. Whether it’s bug reports, new features, or feedback, we welcome it all! Report bugs or request features by creating an issue [here](https://github.com/normal-computing/Branches/issues).

## License

Branches is open-source and continues to uphold the [MIT license](LICENSE).