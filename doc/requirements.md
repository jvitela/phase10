= Phase 10 =

== Entities ==
Board
Action
Card
Dice
CardsContainer
CardsStack
Player

== Tables ==
Game (gameId, state)

== Actions ==

=== User Joins a game ===
// Creates a game if none, or updates current game
// Fails a recent game is already in progress
// Deletes old games ?
=> joinGame

    // only for active player
    <= joinGameSuccess
      - game

    // only for active player
    <= joinGameError
      - message: "Game already in progress"

    // Other users
    <= playerJoinedGame
      - { name, color }

=> startGame
  // all users
<= playerReady
    - { name, color }

=== Game starts ===
<= CHANGE_TURN - next - color - dices [one, two] - actions []

=== Actions take one, two or three ===
=> PLAY_ACTION - action: draw_cards - stacks [1..3]

    // Only for active player
    <= TAKE_CARDS
      - cards [1..3]

    <= USER_DREW_CARDS
      - color
      - stacks []

    => END_TURN
      - discards []

    <= CHANGE_TURN
      - next
        - color
        - dices [one, two]
        - actions []
      - prev
        - discard // top discard must be visible to all players

=== Action: take one & repeat turn ===
=> PLAY_ACTION - color - action: draw_cards - stacks: [1..1]

    <= TAKE_CARDS
      - cards [1..1]

    <= USER_DREW_CARDS
      - color
      - stacks: [1..1]

    => END_TURN
      - discards [1..1]

    <= CHANGE_TURN
      - next
        - color
        - dices [one, two]
        - actions []
      - prev
        - color
        - discard

=== Search Left or Right (Success) ===
=> PLAY_ACTION - color - actionId: search_left|search_right - cardNumber

    // Only to target user
    <= GET_NUMBER
      - number

    => GIVE_CARDS
      - cards [1..1]

    // Only to target user (who takes one from the avail stack)
    <= TAKE_CARDS
      - cards [1..1]

    // Only to active player
    <= TAKE_CARDS
      - cards [1..1]
      - from: color

    // To all other users
    <= USER_RECEIVED_CARD
      - from: color

    => END_TURN
      - discard

    <= CHANGE_TURN
      - next
        - color
        - dices [one, two]
        - actions []
      - prev
        - color
        - discard

=== Search Left or Right (Fail) ===
=> PLAY_ACTION - color - actionId: search_left|search_right - cardNumber

    // Only to active user
    <= TAKE_CARDS
      - cards [1..1]

    <= USER_DREW_CARDS
      - color
      - stacks: [available]

    => END_TURN
      - discard

    <= CHANGE_TURN
      - next
        - color
        - dices [one, two]
        - actions []
      - prev
        - color
        - discard

=== Joker ===
=> PLAY_ACTION - action: Joker

    <= USER_DREW_JOKER
      - card

    => END_TURN
      - discard

    <= CHANGE_TURN
      - next
        - color
        - dices [one, two]
        - actions []
      - prev
        - discard

=== Search One ===
=> PLAY_ACTION - action: search_one

    // Only for requester
    <= CHOOSE_ONE_OF
      - cards[]

    => END_TURN
      - card
      - discard

    <= CHANGE_TURN
      - next
        - color
        - dices [one, two]
        - actions []
      - prev
        - discard

=== Replace cards ===
=> PLAY_ACTION - action: replace_cards - discard [1..4]

    // Only for requester
    <= TAKE_CARDS
      - cards[1..4]

    // Others
    <= USER_DREW_CARDS
      - color
      - stacks: [available, ...]

    => END_TURN
      - discard

    <= CHANGE_TURN
      - next
        - color
        - dices [one, two]
        - actions []
      - prev
        - discard

=== Everyone takes one ===
=> PLAY_ACTION - action: everyone_take1

    // First for active player
    <= TAKE_CARDS
      - cards [1..1]

    // For other players in order
    <= TAKE_CARDS
      - cards [1..1]

    => END_TURN
      - discard

    <= CHANGE_TURN
      - next
        - color
        - dices [one, two]
        - actions []
      - prev
        - discard

== Complete phase (before END_TURN) ==

=> COMPLETE_PHASE - collections [] - type - cards

<= PHASE_COMPLETED - color - phase - collections []

=> UPDATE_COLLECTIONS - color [] - collection [] - cards []

// Add cards to the specified user collection
<= COLLECTIONS_UPDATED - color [] - collection [] - cards []

<= GAME_ROUND_COMPLETE - color - phase
