This project aims to solve the problem of domain-specific Korean vocabulary study.
# Existing work
The [Anki](https://apps.ankiweb.net/) flash card system is a great contribution to the
collective language learning community. It solves the problem of memorization in a 
way that has gone well beyond a minimal viable product. Apps on major mobile platforms
allow convenient casual study when you are out and about. AnkiWeb allows data entry or
card review on desktops for those with that use case, and the underlying sync mechanism
means that your decks and progress can always be persisted. The card review scheduling 
mechanism is thoughtful and effective. The creator of this project has used this tool 
to good effect for over 10 years. There isn't even the need to mention alternatives.

# Compound interest
So if Anki is good enough and has traction, why squirt yet another open source project into
the aether? Won't it be ignored?

First off, small efficiency gains can have a large payoff. Second-language vocabulary study
is something that is time-consuming. If students ever want to become literate at a second language,
they need to invest hundreds of hours into vocabulary study. Spaced repetition seems like
a relatively small investment as you do it, because it's infrequent and in small chunks when
that time would otherwise just go into reading online news, but it adds up.

So the creator of this project opted to spend a lump sum of his time to make himself more efficient
at studying because it's likely to pay dividends to him personally, regardless of whether other
people use it.

# Domain-specific problems

## The graph-like nature of East Asian languages
While reviewing and studying vocabulary in Korean, the inevitable conclusion one reaches is that
Hanja word roots are a very useful learning tool. I'm not the first to think this; see 
*Handbook of Korean Vocabulary*.

It can be thought of as a Graph-like structure. If each Korean word consisting of multiple Hanja
roots is a graph node, and so are individual Hanja, a word node is connected to its requisite
Hanja node. We can traverse this graph from one word node to nearby word nodes, and words that
have low topological distance from one another tend to have similar meanings. This is practically
useful for a couple of reasons.

* Anecdotally, words for which you've already internalized words that share one or more Hanja are 
  much easier to learn than otherwise. I've reached the point where I don't even add a word to 
  my flash card deck if I don't recognize at least one of the underlying Hanja roots, because 
  it's such a waste of time to try to memorize it.

* Reviewing words in clusters is potentially a more useful and efficient than reviewing them divorced 
  of context. I naturally find myself thinking "what is the difference between these two words?" 
  For example, "판결" and "결정" which share the "결" root and both could be loosely translated as 
  "decide" or "resolve." Without even thinking too hard on the essential meaning of each character, 
  you can note that "판" also occurs in "판사" (judge, the vocation) and "재판" (trial). If you
  already happens to know these two words, you can essentially study all of them at once, and also 
  have a better chance of knowing when to use each word - 판결 for formal decisions by official 
  bodies, "결정" as less formal or personal resolutions or conclusions.

## Decoupling grammar from meaning
Different parts of speech are formed through Korean grammatical patterns, so the same word root can
be a part of several Korean "words" that can be seen as a grammatical conjugation of that word root.
For example:

계산 is present in the following words:

* 계산 - A calculation
* 계산하다 - To calculate
* 계산적이다 - Computational, of or relating to computation or calculation

Or for 번덕:

* 변덕 - Whim
* 변덕스럽다 - Whimsical
* 변덕을 부리다- To behave whimsically

Language learners can easily know one of these and guess the others through context.

Dictionaries such as [Naver](https://endic.naver.com) list all of these words individually. When 
constructing flash card decks, it's very easy to end up with all of these in your deck despite
features of that program which would prevent duplicates.

Preventing duplication through schematization and uniqueness constraints prevents this, meaning less
irrelevant information and a greater ability of the scheduling algorithm to develop balanced study sets.

## Enabling reading for pleasure
Language production and comprehension are very complex tasks. The traditional breakdown into reading,
writing, listening, and  speaking is very useful because you can be very good at one or two of these things
while being hopeless at the other.

In my experience, there's a pretty big gap between the ability to comprehend a word written in L2 and
use the same word in a spoken sentence. So that means we should focus on studying words in our active
vocabulary, right? After all, aren't we more likely to just forget words we don't use?

In a classroom focused on speaking skills, yes, and this is what most people tend to focus on for good
reasons. Being able to speak a language has the most practical benefit. But speaking is only 
something you can do with people, and opportunities are naturally going be limited in an adult's life,
when at least 8 hours is devoted to your day job.

Flash cards are a great way to expose yourself to vocabulary, and *reading* is the perfect companion for
a busy adult to actually exercise vocabulary so it can be retained.

The problem is that most adults will not have patience for reading material that has too low a reading,
and having a functional conversational vocabulary is not good enough to reach a flow state when reading
authentic L2 texts, which stands in the way of the "pleasure" part of "reading for pleasure." 

Using and exercising a large reading vocabulary is a lot easier than maintaing a large number of words
you can authentically produce in a sentence. So this leads to the ability to reach a flow state while
reading genuinely interesting L2 material - novels and news.

Which suggests that performing study tasks that are targeted at increasing the number of words you can read
has an outsized effect on language acquisition. As you becomes better able to read genuinely interesting
things in L2, you spend more time in L2, which improves the other skills as well.

And Korean is a great language to streamline this process. Once you acquire a decent number of words roots,
it's very feasible to scan a sentence where you don't recognize several words and still derive the
essential meaning, meaning less time spent with your nose in a dictionary, less interruptions to flow state,
and more genuine pleasure and interest.

# Differentiating features of this project
Following the above observations, we focus on creating a review flow based on the following principles.

* A card view that allows the user to naturally see words that are connected through roots that they know.
* A review scheduling algorithm that schedules cards based on whether you have seen related words recently 
  (and thereby implicitly reviewed that word).
* L2 to L1 cards only, since an explicit non-goal of this project is improving functional vocabulary
  directly.
* Shades of meaning conveyed through example sentences in Korean, not the addition of additional English 
  synonyms.
* Aggressive deduplication of words that differ only in their grammatical usage and not essential meaning.


Another explicit non-goal of this project is to teach its users how to read of write Hanja themselves. In
my experience, with Korean at least this is a massive waste of time that distracts from actual useful
language skills.
