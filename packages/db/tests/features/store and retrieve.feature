Feature: Store and retrieve key-value pairs
  It should be possible to store key-value pairs and
  later retrieve them easily and reliably.

  Scenario Outline: Simple key-value pairs
    When I store <Key>=<Value> in the database
    Then I can verify that <Key>=<Value> is in the database
    Examples:
      | Key   | Value |
      | hello | world |
      | 1     | john  |
      | acme  | 123   |
      | other | false |

  Scenario Outline: Hierarchical key-value pairs
    When I store <Key>=<Value> in the database
    Then I can verify that <Key>=<Value> is in the database
    Examples:
      | Key          | Value |
      | users:1      | john  |
      | orgs:acme    | 123   |
      | orgs:users:1 | mike  |

  Scenario Outline: Arrays for keys
    Given database containing
      | Key             | Value |
      | [users, 1]      | john  |
      | [users, acme]   | 123   |
      | [users, van, 1] | mike  |
    Then I can verify that <Key>=<Value> is in the database
    Examples:
      | Key             | Value |
      | users:1         | john  |
      | [users, acme]   | 123   |
      | [users, van, 1] | mike  |

  Scenario Outline: Objects as values
    When I store <Key>=<Value> in the database
    Then I can verify that <Key>=<Value> is in the database
    Examples:
      | Key          | Value             |
      | users:1      | { name: 'john' }  |
      | orgs:acme    | { id: 123 }       |
      | orgs:users:1 | { name: 'mike' }  |
