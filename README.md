# Tutor-Complete

Educational game and Intelligent Tutoring System that can be used in a Languages and Automata (Theory of Computation) course. Honors thesis for a Wellesley College Bachelor of Arts in Computer Science. Includes two activities spanning three "worlds" of increasing difficulty. Uses Bayesian Knowledge Tracing to estimate students' mastery of each activity and determine whether they are allowed to move to the next "world".

![](https://user-images.githubusercontent.com/6687333/230311531-df0a7740-46d1-4963-9f81-79963784c225.png)

## Deterministic Finite-State Automata Activity

In this activity, students construct Deterministic Finite-State Automata (DFAs) to recognize a variety of regular languages.

The three "worlds" have associated difficulty levels of languages to recognize.
![](https://user-images.githubusercontent.com/6687333/230311566-1a35d693-80bf-4e88-8313-4215d6a5d276.png)

The student's DFA must end in an accept state for a sample string in the language, and end in a non-accept state for a sample string not in the language.
![](https://user-images.githubusercontent.com/6687333/230311557-b1af1988-9304-4c8e-8884-6094a90fa574.png)

The system can generate hints using graph similarity and a Markov Decision Process:

1. Cluster prior student DFAs for the same language by graph similarity.
2. Identify the cluster to which the student's current in-progress DFA belongs.
3. Get all next steps that prior students took from the current graph cluster.
4. Use an MDP to identify the next step that was most likely to lead to a correct final DFA.

![](https://user-images.githubusercontent.com/6687333/230311596-3028ffeb-dc7a-4ce1-bac4-a81d674be540.png)

## Pumping Lemma Activity

In this activity, students make a series of choices to construct a proof using the pumping lemma that a given language is not regular. For example, one choice the student makes is to choose a reason why a particular string is a counterexample to the assertion that the language is regular.

![](https://user-images.githubusercontent.com/6687333/230311587-f31a080b-8d24-400e-b76c-0cf3f5d1ca6d.png)
