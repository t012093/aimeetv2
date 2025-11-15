from app.core.config import settings
from typing import Dict, List, Any
import json


class LLMService:
    """LLM service for shift optimization"""

    @staticmethod
    async def optimize_shifts(
        shift_requests: List[Dict[str, Any]],
        projects: List[Dict[str, Any]],
        month: str,
    ) -> Dict[str, Any]:
        """Optimize shifts using LLM"""

        # Prepare prompt
        prompt = f"""
        あなたはNPOのシフト管理システムのAIアシスタントです。
        以下のシフト希望とプロジェクト情報を元に、最適なシフト割り当てを提案してください。

        ## 対象月
        {month}

        ## プロジェクト情報
        {json.dumps(projects, ensure_ascii=False, indent=2)}

        ## シフト希望
        {json.dumps(shift_requests, ensure_ascii=False, indent=2)}

        ## 最適化の条件
        1. 各プロジェクトの required_members を満たすこと
        2. メンバーの希望をできるだけ尊重すること
        3. 一人のメンバーの負担が偏らないようにすること
        4. シフトの重複がないようにすること

        ## 出力形式
        以下のJSON形式で出力してください：
        {{
          "assignments": [
            {{
              "user_id": "ユーザーID",
              "project_id": "プロジェクトID",
              "date": "YYYY-MM-DD",
              "start_time": "HH:MM",
              "end_time": "HH:MM"
            }}
          ],
          "summary": {{
            "total_shifts": 総シフト数,
            "members_utilized": 使用メンバー数,
            "coverage_rate": カバー率（%）,
            "notes": ["注意事項1", "注意事項2"]
          }}
        }}
        """

        # Call LLM based on provider
        if settings.AI_PROVIDER == "claude":
            return await LLMService._call_claude(prompt)
        elif settings.AI_PROVIDER == "openai":
            return await LLMService._call_openai(prompt)
        elif settings.AI_PROVIDER == "gemini":
            return await LLMService._call_gemini(prompt)
        else:
            raise ValueError(f"Unsupported AI provider: {settings.AI_PROVIDER}")

    @staticmethod
    async def _call_claude(prompt: str) -> Dict[str, Any]:
        """Call Anthropic Claude API"""
        from anthropic import AsyncAnthropic

        client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

        message = await client.messages.create(
            model=settings.ANTHROPIC_MODEL,
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}],
        )

        # Extract JSON from response
        content = message.content[0].text
        # Try to find JSON in the response
        start_idx = content.find("{")
        end_idx = content.rfind("}") + 1
        if start_idx != -1 and end_idx != 0:
            json_str = content[start_idx:end_idx]
            return json.loads(json_str)
        else:
            raise ValueError("Failed to extract JSON from Claude response")

    @staticmethod
    async def _call_openai(prompt: str) -> Dict[str, Any]:
        """Call OpenAI API"""
        from openai import AsyncOpenAI

        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.3,
        )

        content = response.choices[0].message.content
        return json.loads(content)

    @staticmethod
    async def _call_gemini(prompt: str) -> Dict[str, Any]:
        """Call Google Gemini API"""
        import google.generativeai as genai

        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel(settings.GEMINI_MODEL)

        response = await model.generate_content_async(
            prompt,
            generation_config={"response_mime_type": "application/json"},
        )

        return json.loads(response.text)
