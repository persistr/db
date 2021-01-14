Feature: Delete key-value pairs
  It should be possible to delete key-value pairs from the database.

  Scenario Outline: Delete individual keys
    Given database containing
      | Key             | Value |
      | [users, 1]      | john  |
      | [users, acme]   | 123   |
      | [users, van, 1] | mike  |
    When I delete <Key>
    Then I can verify that <Key> is NOT in the database
    Examples:
      | Key             |
      | users:1         |
      | [users, acme]   |
      | [users, van, 1] |

  Scenario Outline: Delete all keys
    Given database containing
      | Key             | Value |
      | [users, 1]      | john  |
      | [users, acme]   | 123   |
      | [users, van, 1] | mike  |
    When I clear the database
    Then I can verify that <Key> is NOT in the database
    Examples:
      | Key             |
      | users:1         |
      | [users, acme]   |
      | [users, van, 1] |
