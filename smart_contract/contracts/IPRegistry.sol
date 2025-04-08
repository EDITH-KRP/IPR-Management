// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract IPRegistry {
    struct IPDetails {
        string title;
        string applicant;
        string filingDate;
        string status;
    }

    mapping(string => IPDetails) private ipDatabase;  // Mapping Patent Number → IP Details

    // Event for logging new IP registrations
    event IPRegistered(string indexed patentNumber, string title, string applicant);

    // Function to add IP data (only by owner)
    function addIP(
        string memory _patentNumber,
        string memory _title,
        string memory _applicant,
        string memory _filingDate,
        string memory _status
    ) public {
        require(bytes(ipDatabase[_patentNumber].title).length == 0, "IP already exists");
        
        ipDatabase[_patentNumber] = IPDetails(_title, _applicant, _filingDate, _status);
        
        emit IPRegistered(_patentNumber, _title, _applicant);
    }

    // Function to retrieve IP details
    function getIPDetails(string memory _patentNumber)
        public
        view
        returns (string memory, string memory, string memory, string memory)
    {
        require(bytes(ipDatabase[_patentNumber].title).length > 0, "IP not found");

        IPDetails memory ip = ipDatabase[_patentNumber];
        return (ip.title, ip.applicant, ip.filingDate, ip.status);
    }
}
