---
title: Minishell
subtitle: A small Unix shell written from scratch in C for the 42 curriculum.
---

Minishell is a 42 project: a Unix shell built from scratch in C as a team of two, to understand what happens between typing a command and seeing its output.

It runs commands by absolute path, relative path or PATH lookup, and supports pipes and the redirections `>`, `<`, `>>` and `<<`. It expands environment variables, handles single and double quotes, reacts to `Ctrl+C`, `Ctrl+D` and `Ctrl+\`, returns the right exit status, and implements the builtins `cd`, `echo`, `pwd`, `export`, `unset`, `env` and `exit`.

The interesting parts are on the process side: `fork`, `execve`, `wait` and signals. Heredocs across a pipeline needed a unique temporary file per shell instance, one of the later fixes. The repository includes a syntax test script and a leak check.

I learned how UNIX processes work, how to tokenise and parse input, and how to manage memory carefully in C.
