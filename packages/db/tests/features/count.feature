Feature: Count key-value pairs
  It should be possible to count the number of
  key-value pairs stored in the database.

  Scenario: Basic count of key-value pairs in the database
    Given database containing
      | Key             | Value |
      | [users, 1]      | john  |
      | [users, acme]   | 123   |
      | [users, van, 1] | mike  |
    Then I can verify that there are 3 keys in the database

  Scenario: Accurate count after adding key-value pairs
    Given database containing
      | Key             | Value |
      | [users, 1]      | john  |
      | [users, acme]   | 123   |
      | [users, van, 1] | mike  |
    When I store hello=world in the database
    Then I can verify that there are 4 keys in the database

  Scenario: Accurate count after deleting key-value pairs
    Given database containing
      | Key             | Value |
      | [users, 1]      | john  |
      | [users, acme]   | 123   |
      | [users, van, 1] | mike  |
    When I delete users:1
    Then I can verify that there are 2 keys in the database
