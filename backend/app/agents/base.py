from abc import ABC, abstractmethod
from typing import Any, Dict

class BaseAgent(ABC):
    def __init__(self, name: str, role: str):
        self.name = name
        self.role = role

    @abstractmethod
    async def process(self, context: Dict[str, Any]) -> Any:
        """
        Process the transaction context and return a structured Pydantic object.
        """
        pass
