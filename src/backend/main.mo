import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";



actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile System
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Finance Entry Types
  public type EntryType = { #income; #expense; #saving };

  public type FinanceEntry = {
    id : Text;
    owner : Principal;
    amount : Float;
    date : Int; // unix timestamp
    category : Text;
    entryType : EntryType;
    description : Text;
  };

  let financeEntries = Map.empty<Text, FinanceEntry>();

  // Helper function to generate entry key (owner + id)
  private func makeEntryKey(owner : Principal, id : Text) : Text {
    owner.toText() # ":" # id;
  };

  // Helper function to check entry ownership
  private func checkEntryOwnership(caller : Principal, entry : FinanceEntry) : Bool {
    entry.owner == caller or AccessControl.isAdmin(accessControlState, caller);
  };

  public shared ({ caller }) func addFinanceEntry(id : Text, amount : Float, date : Int, category : Text, entryType : EntryType, description : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add finance entries");
    };

    let entryKey = makeEntryKey(caller, id);

    // Check if entry already exists
    switch (financeEntries.get(entryKey)) {
      case (?_) { Runtime.trap("Finance entry with this ID already exists") };
      case (null) {
        let entry : FinanceEntry = {
          id;
          owner = caller;
          amount;
          date;
          category;
          entryType;
          description;
        };
        financeEntries.add(entryKey, entry);
      };
    };
  };

  public shared ({ caller }) func updateFinanceEntry(id : Text, amount : Float, date : Int, category : Text, entryType : EntryType, description : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update finance entries");
    };

    let entryKey = makeEntryKey(caller, id);

    switch (financeEntries.get(entryKey)) {
      case (null) { Runtime.trap("Finance entry not found") };
      case (?existingEntry) {
        if (not checkEntryOwnership(caller, existingEntry)) {
          Runtime.trap("Unauthorized: You can only update your own finance entries");
        };

        let updatedEntry : FinanceEntry = {
          id;
          owner = caller;
          amount;
          date;
          category;
          entryType;
          description;
        };
        financeEntries.add(entryKey, updatedEntry);
      };
    };
  };

  public shared ({ caller }) func deleteFinanceEntry(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete finance entries");
    };

    let entryKey = makeEntryKey(caller, id);

    switch (financeEntries.get(entryKey)) {
      case (null) { Runtime.trap("Finance entry not found") };
      case (?existingEntry) {
        if (not checkEntryOwnership(caller, existingEntry)) {
          Runtime.trap("Unauthorized: You can only delete your own finance entries");
        };
        financeEntries.remove(entryKey);
      };
    };
  };

  public query ({ caller }) func getFinanceEntry(id : Text) : async FinanceEntry {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view finance entries");
    };

    let entryKey = makeEntryKey(caller, id);

    switch (financeEntries.get(entryKey)) {
      case (null) { Runtime.trap("Finance entry not found") };
      case (?entry) {
        if (not checkEntryOwnership(caller, entry)) {
          Runtime.trap("Unauthorized: You can only view your own finance entries");
        };
        entry;
      };
    };
  };

  public query ({ caller }) func getAllFinanceEntries() : async [FinanceEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view finance entries");
    };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    financeEntries.values().toArray().filter(func(entry : FinanceEntry) : Bool {
      isAdmin or entry.owner == caller;
    });
  };

  public query ({ caller }) func getEntriesByType(entryType : EntryType) : async [FinanceEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view finance entries");
    };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    financeEntries.values().toArray().filter(func(entry : FinanceEntry) : Bool {
      (isAdmin or entry.owner == caller) and entry.entryType == entryType;
    });
  };

  public query ({ caller }) func getEntriesByDateRange(startDate : Int, endDate : Int) : async [FinanceEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view finance entries");
    };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    financeEntries.values().toArray().filter(func(entry : FinanceEntry) : Bool {
      (isAdmin or entry.owner == caller) and entry.date >= startDate and entry.date <= endDate;
    });
  };
};

