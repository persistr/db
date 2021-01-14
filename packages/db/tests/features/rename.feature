Feature: Rename keys
  It should be possible to rename keys after they've
  already been stored in the database.

  Scenario: Rename a key
    Given database containing
      | Key             | Value |
      | [users, 1]      | john  |
      | [users, acme]   | 123   |
      | [users, van, 1] | mike  |
    When I rename users:acme to users:van:2
    Then I can verify that users:van:2=123 is in the database
    And I can verify that users:acme is NOT in the database
