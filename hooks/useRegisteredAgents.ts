import { useState, useEffect } from 'react';
import { readContract, isAddress } from 'thirdweb';
import { agentContract } from '@/constants/thirdweb';

export interface RegisteredAgent {
  address: string;
  name: string;
  isRegistered: boolean;
}

// For demo purposes, we'll maintain a list of known agent addresses
// In a production app, you would fetch this from an API or event logs
const KNOWN_AGENT_ADDRESSES = [
  '0x742d35Cc8Cd4c6478F3B0B5d6d51a66D26c2C7e6',
  '0x8ba1f109551bD432803012645aac136c5E96bb1a',
  '0x2dF1a3b5F8eF7d3B5e6c7d8F9eA1bC2d3e4F5a67',
  '0x9aB3c4D5e6F7a8b9c0d1e2f3a4b5c6d7e8f9a0b1',
  '0x1a2B3c4D5e6F7a8b9c0d1e2f3a4b5c6d7e8f9a0',
];

// Demo agent names mapping
const AGENT_NAMES: { [key: string]: string } = {
  '0x742d35Cc8Cd4c6478F3B0B5d6d51a66D26c2C7e6': 'Agent John - Downtown Branch',
  '0x8ba1f109551bD432803012645aac136c5E96bb1a': 'Agent Mary - Uptown Mall',
  '0x2dF1a3b5F8eF7d3B5e6c7d8F9eA1bC2d3e4F5a67': 'Agent Bob - Central Station',
  '0x9aB3c4D5e6F7a8b9c0d1e2f3a4b5c6d7e8f9a0b1': 'Agent Sarah - Market Square',
  '0x1a2B3c4D5e6F7a8b9c0d1e2f3a4b5c6d7e8f9a0': 'Agent Mike - Airport Terminal',
};

export function useRegisteredAgents() {
  const [agents, setAgents] = useState<RegisteredAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = async () => {
    if (!agentContract) {
      setError('Agent contract not available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const agentPromises = KNOWN_AGENT_ADDRESSES.map(async (address) => {
        try {
          // Validate address format first
          if (!isAddress(address)) {
            console.error(`Invalid address format: ${address}`);
            return {
              address,
              name: AGENT_NAMES[address] || `Agent ${address.slice(0, 8)}...`,
              isRegistered: false,
            };
          }

          const isRegistered = await readContract({
            contract: agentContract!,
            method: 'function registeredAgents(address) view returns (bool)',
            params: [address],
          });

          return {
            address,
            name: AGENT_NAMES[address] || `Agent ${address.slice(0, 8)}...`,
            isRegistered,
          };
        } catch (error) {
          console.error(`Error checking agent ${address}:`, error);
          return {
            address,
            name: AGENT_NAMES[address] || `Agent ${address.slice(0, 8)}...`,
            isRegistered: false,
          };
        }
      });

      const agentResults = await Promise.all(agentPromises);
      const registeredAgents = agentResults.filter(agent => agent.isRegistered);
      
      setAgents(registeredAgents);
    } catch (error: any) {
      console.error('Error fetching agents:', error);
      setError(error.message || 'Failed to fetch registered agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const refetch = () => {
    fetchAgents();
  };

  return { agents, loading, error, refetch };
}

export async function checkIfRegisteredAgent(address: string): Promise<boolean> {
  if (!agentContract || !address) {
    return false;
  }

  // Validate address format
  if (!isAddress(address)) {
    console.error(`Invalid address format: ${address}`);
    return false;
  }

  try {
    const isRegistered = await readContract({
      contract: agentContract!,
      method: 'function registeredAgents(address) view returns (bool)',
      params: [address],
    });
    return isRegistered;
  } catch (error) {
    console.error('Error checking agent registration:', error);
    return false;
  }
}
