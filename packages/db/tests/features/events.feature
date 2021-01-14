Feature: Events
  Database should send events when data is changed by
  the connected client. Events are not sent when data
  is changed by other clients.

  Scenario: Storing a key-value pair should notify the client
    Given database containing
      | Key             | Value |
      | [users, 1]      | john  |
      | [users, acme]   | 123   |
      | [users, van, 1] | mike  |
    When I store hello=world in the database
    Then I am notified of hello=world having been stored

  Scenario: Deleting a key should notify the client
    Given database containing
      | Key             | Value |
      | [users, 1]      | john  |
      | [users, acme]   | 123   |
      | [users, van, 1] | mike  |
    When I delete users:acme
    Then I am notified of users:acme having been deleted

  Scenario: Renaming a key should notify the client
    Given database containing
      | Key             | Value |
      | [users, 1]      | john  |
      | [users, acme]   | 123   |
      | [users, van, 1] | mike  |
    When I rename users:acme to users:van:2
    Then I am notified of users:acme having been renamed to users:van:2

  Scenario: Clearing the database should notify the client
    Given database containing
      | Key             | Value |
      | [users, 1]      | john  |
      | [users, acme]   | 123   |
      | [users, van, 1] | mike  |
    When I clear the database
    Then I am notified of all of the following having been deleted in this order
      | Key         |
      | users:1     |
      | users:acme  |
      | users:van:1 |
