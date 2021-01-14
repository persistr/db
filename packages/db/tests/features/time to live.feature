Feature: Time-to-live
  While storing key-value pairs, it should be possible
  to set a time-to-live (TTL) limit in milliseconds.

  Scenario Outline: Long-lived key-value pairs
    When I store <Key>=<Value> with TTL=<TTL>
    Then I can verify that <Key>=<Value> is in the database
    Examples:
      | Key   | Value | TTL   |
      | hello | world | 10000 |
      | 1     | john  | 10000 |
      | acme  | 123   | 10000 |
      | other | false | 10000 |

  Scenario Outline: Short-lived key-value pairs
    When I store <Key>=<Value> with TTL=<TTL>
    And wait 2 milliseconds
    Then I can verify that <Key> is NOT in the database
    Examples:
      | Key   | Value | TTL   |
      | hello | world | 1     |
      | 1     | john  | 1     |
      | acme  | 123   | 1     |
      | other | false | 1     |

  Scenario Outline: Immediately expiring key-value pairs
    When I store <Key>=<Value> with TTL=<TTL>
    Then I can verify that <Key> is NOT in the database
    Examples:
      | Key   | Value | TTL    |
      | hello | world | 0      |
      | 1     | john  | -1     |
      | acme  | 123   | -1000  |
      | other | false | -10000 |
