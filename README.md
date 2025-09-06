Mycelia is a project to support deeply-linked & cross-referential digital gardens.

#### Site Structure
"posts" are called leafs, these are things like blog posts, thought ideas, etc
"projects" which contain a set of leafs attached to them, these would be called branches
A "person" (the author, people they've worked with), internally these are called trunks
Trunks & Branches have inherit hierarchy - we can have projects & sub-projects recursively, leafs can be attached at any point. Everything connects together to form a "forest", this is a forest of ideas.

#### Package Structure
- @mycelia/site -> unified CRM portal (built last)
- @mycelia/engine -> contains classes to represent links
- @mycelia/graph -> creates a node-based graph from the links
- @mycelia/api -> from a static json representation of the links, exposes different parts via api
- @mycelia/render -> renderer of our custom tags in a markdown page

#### Markdown format
We're making heavy use of `<Tags>` inside of markdown to represent relationships between objects.

Example:
```
<Project name="Dream Machines" status="wip">
  <Date of="2025-08-31 10:20" duration="120">
    Began outlining the concept of blending surrealist film imagery with modular synth textures.
  </Date>

  <Research type="study">
    <Book id="freud-dreams">Sigmund Freud - The Interpretation of Dreams</Book>
    <Film id="lynch-mulholland">David Lynch - Mulholland Drive</Film>
    Notes: layering disorientation through sonic motifs.
  </Research>

  <Research type="experiment">
    Tried running <Track id="synth-loop-01">Synth Loop 01</Track> through tape delay.
    Outcome: created warped “breathing” effect, will reuse in <Song id="nightmare-suite"/>.
  </Research>

  <Essay title="Surrealism in Sound: How Dreams Inform Recording Practices">
    Draft section written on <Date of="2025-09-01" duration="45"/>.
    Connected with earlier <Research type="logs">notes on Lynchian soundscapes</Research>.
  </Essay>

  <Person id="cblackwell">Cameron Blackwell</Person> suggested the <Concept id="tape-saturation">tape saturation</Concept> experiment.

  <Tag>surrealism</Tag>
  <Tag>sound-design</Tag>
</Project>
```

This will need to build up a tree of interlinked leafs, branches, and trunks, which can then be visualised using a node-based visualiser like the one in obsidian. The other important thing is that at build-time, the code knows how to link everything together consistently.

#### Goals
1. Get the markdown parsing working & generating
    - needs to generate consistent links based on tag id's
    - needs to generate a json artifact blob of the whole graph
2. Generate site pages based on markdown parsing & json blob -> React components
3. Expose via json blob via api functions, be able to query the json blob for different parts
4. Add Typst support, expand beyond markdown.
5. Node-graph based visualisation
