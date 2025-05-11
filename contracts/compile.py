import json
import os
import solcx

# Install specific Solidity compiler version
solcx.install_solc('0.8.20')

def compile_contract():
    """Compile the IPNFT contract"""
    print("Compiling IPNFT contract...")
    
    # Set the Solidity compiler version
    solcx.set_solc_version('0.8.20')
    
    # Get contract path
    contract_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'IPNFT.sol')
    
    # Compile the contract
    compiled_sol = solcx.compile_files(
        [contract_path],
        output_values=['abi', 'bin'],
        solc_version='0.8.20',
        import_remappings=[
            '@openzeppelin=node_modules/@openzeppelin'
        ]
    )
    
    # Get contract key
    contract_id = f"{contract_path}:IPNFT"
    
    # Extract ABI and bytecode
    contract_abi = compiled_sol[contract_id]['abi']
    contract_bin = compiled_sol[contract_id]['bin']
    
    # Create output directory if it doesn't exist
    os.makedirs(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'abi'), exist_ok=True)
    
    # Write ABI to file
    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'abi/IPNFT.json'), 'w') as f:
        json.dump(contract_abi, f, indent=2)
    
    # Write bytecode to file
    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'abi/IPNFT_bytecode.json'), 'w') as f:
        json.dump({"bytecode": contract_bin}, f, indent=2)
    
    print("Compilation successful!")
    print(f"ABI saved to {os.path.join(os.path.dirname(os.path.abspath(__file__)), 'abi/IPNFT.json')}")
    print(f"Bytecode saved to {os.path.join(os.path.dirname(os.path.abspath(__file__)), 'abi/IPNFT_bytecode.json')}")
    
    return contract_abi, contract_bin

if __name__ == "__main__":
    compile_contract()