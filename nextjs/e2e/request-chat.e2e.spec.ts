import { expect, test } from '@playwright/test';

// 필요시 테스트 계정/시드 데이터 유틸 import
// import { seedTestUsers } from './utils/seed';

test.describe('요청 수락 → 채팅 생성 → 채팅 송수신', () => {
  test.setTimeout(100000);
  test('A가 B에게 요청, B가 수락, 채팅방 생성 및 실시간 채팅', async ({ browser }) => {
    // Playwright 위치 권한 및 좌표(서울) 부여
    // 1. A 유저 로그인 및 요청 전송
    const context = await browser.newContext({
      geolocation: { latitude: 37.5665, longitude: 126.978 }, // 서울 좌표
      permissions: ['geolocation'],
    });
    const pageA = await context.newPage();
    await pageA.goto('http://localhost:3000/auth/signin');
    await pageA.waitForSelector('input[type="email"]', { timeout: 10000 });
    await pageA.waitForSelector('input[type="password"]', { timeout: 10000 });
    await pageA.fill('input[type="email"]', 'a@test.com');
    await pageA.fill('input[type="password"]', 'passwordA');
    await pageA.click('button[type="submit"]');
    await pageA.waitForURL('**/home');

    // 1-1. 'Current Location:'이 포함된 span을 텍스트로 찾고, 그 하위 span(도시명)이 비어있지 않을 때까지 대기
    const parentSpan = pageA.locator('span:has-text("Current Location:")');
    const citySpan = parentSpan.locator('span');
    await expect(citySpan).not.toHaveText('', { timeout: 20000 });

    // 2. traveler-card가 렌더링될 때까지 대기 (Test_B가 리스트에 있는지 확인)
    await expect(pageA.locator('text=Test_B')).toBeVisible({ timeout: 20000 });

    // 3. Test_B에게 요청 전송 (이름 span에서 부모로 올라가서 버튼 클릭)
    const testBCard = pageA.locator('text=Test_B').first();
    await testBCard.locator('xpath=../../..').locator('button:has-text("Send Request")').click();

    // 3-1. RequestModal이 뜨는지 대기
    const modal = pageA.locator('.fixed.inset-0.bg-black.bg-opacity-50');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // 3-2. textarea에 메시지 입력
    await modal.locator('textarea').fill('테스트 요청입니다.');

    // 3-3. Send 버튼 클릭
    await modal.locator('button:has-text("Send")').click();

    // 3-4. 토스트(텍스트) 대기, 실패 시 버튼 텍스트로 대기
    try {
      await expect(pageA.locator('text=Request sent successfully!')).toBeVisible({
        timeout: 10000,
      });
    } catch (e) {
      // 토스트가 안 뜨면 버튼 텍스트로 대기
      await expect(
        testBCard.locator('xpath=../../..').locator('button:has-text("Request Pending")'),
      ).toBeVisible({ timeout: 10000 });
    }

    // // 4. B 유저 로그인 (새 창)
    const pageB = await browser.newPage();
    await pageB.goto('http://localhost:3000/auth/signin');
    await pageB.waitForSelector('input[type="email"]', { timeout: 10000 });
    await pageB.waitForSelector('input[type="password"]', { timeout: 10000 });
    await pageB.fill('input[type="email"]', 'b@test.com');
    await pageB.fill('input[type="password"]', 'passwordB');
    await pageB.click('button[type="submit"]');
    await pageB.waitForURL('**/home');

    // 5. B가 요청 목록에서 A의 요청을 수락
    await pageB.goto('http://localhost:3000/request');
    await pageB.waitForTimeout(3000); // 네트워크/API 지연을 고려해 3초 대기
    // 'Test_A' 텍스트가 포함된 카드(div)에서 Accept 버튼 클릭
    const cardDiv = pageB.locator('div', { has: pageB.locator('text=Test_A') }).first();
    await expect(cardDiv).toBeVisible({ timeout: 20000 });
    await cardDiv.locator('button:has-text("Accept")').click();
    await expect(
      pageB.locator('text=Request accepted successfully! Chat room is created.'),
    ).toBeVisible({ timeout: 10000 });

    // 6. 채팅방 자동 생성 확인 (B)
    await pageB.waitForTimeout(7000); // 채팅방 생성 완료를 위한 더 긴 대기
    await pageB.goto('http://localhost:3000/chat');
    await pageB.waitForTimeout(7000); // 네트워크/DB 지연 고려

    // 채팅방 목록이 1개 이상일 때까지(상대방 이름 등으로) 대기
    await expect(pageB.locator('text=Test_A')).toBeVisible({ timeout: 40000 });
    await pageB.locator('text=Test_A').click();
    // 채팅방 내부에서 메시지 입력창 등으로 대기
    await expect(pageB.locator('input, textarea, [placeholder="Type a message..."]')).toBeVisible({
      timeout: 40000,
    });

    // 7. A도 채팅방 진입
    await pageA.goto('http://localhost:3000/chat');
    await pageA.waitForTimeout(7000); // 네트워크/DB 지연 고려
    // 채팅방 목록이 1개 이상일 때까지(상대방 이름 등으로) 대기
    await expect(pageA.locator('text=Test_B')).toBeVisible({ timeout: 40000 });
    // 채팅방 클릭
    await pageA.locator('text=Test_B').click();
    // 채팅방 내부에서 메시지 입력창 등으로 대기
    await expect(pageA.locator('input, textarea, [placeholder="Type a message..."]')).toBeVisible({
      timeout: 40000,
    });

    // 8. A가 메시지 전송
    await pageA.fill('input[placeholder="Type a message..."]', '안녕하세요!');
    await pageA.click('button:has-text("Send")');

    // 9. B가 실시간으로 메시지 수신 확인
    await pageB.goto('http://localhost:3000/chat');
    await pageB.waitForTimeout(7000);
    await expect(pageB.locator('text=Test_A')).toBeVisible({ timeout: 40000 });
    await pageB.locator('text=Test_A').click();
    await expect(pageB.locator('input[placeholder="Type a message..."]')).toBeVisible({
      timeout: 40000,
    });
    await pageB.waitForTimeout(7000); // 메시지 패칭 지연을 고려해 더 긴 대기
    // 메시지가 실제로 렌더링될 때까지 대기 (채팅방 내 p 태그에서 텍스트로 찾기)
    await expect(
      pageB.locator('div.flex').locator('p', { hasText: '안녕하세요!' }).first(),
    ).toBeVisible({ timeout: 20000 });

    // 10. B가 답장
    await pageB.fill('input[placeholder="Type a message..."]', '반가워요!');
    await pageB.click('button:has-text("Send")');
    // A가 B의 답장을 실시간으로 수신 확인 (채팅방 내 p 태그에서 텍스트로 찾기)
    await expect(
      pageA.locator('div.flex').locator('p', { hasText: '반가워요!' }).first(),
    ).toBeVisible({ timeout: 20000 });
  });
});
