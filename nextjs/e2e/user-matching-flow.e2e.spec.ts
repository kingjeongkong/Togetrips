import { expect, test } from '@playwright/test';

// 필요시 테스트 계정/시드 데이터 유틸 import
// import { seedTestUsers } from './utils/seed';

test.describe('사용자 매칭 플로우', () => {
  test.setTimeout(100000);
  test('요청 → 수락 → 채팅방 생성 → 실시간 채팅', async ({ browser }) => {
    // Playwright 위치 권한 및 좌표(서울) 부여
    // 1. A 유저 로그인 및 요청 전송
    const context = await browser.newContext({
      geolocation: { latitude: 37.5665, longitude: 126.978 }, // 서울 좌표
      permissions: ['geolocation'],
    });
    const pageA = await context.newPage();
    await pageA.goto('http://localhost:3000/auth/signin');

    // 접근성 기반 로그인
    await pageA.getByLabel('Email Address').fill('a@test.com');
    await pageA.getByLabel('Password').fill('passwordA');
    await pageA.getByRole('button', { name: 'Sign In' }).click();
    await pageA.waitForURL('**/home');

    // 1-1. 위치 정보 로딩 대기 (aria-label 기반)
    await expect(pageA.getByLabel('Location information')).toBeVisible({ timeout: 20000 });
    await expect(pageA.getByLabel('Current city')).not.toHaveText('', { timeout: 20000 });

    // 2. traveler-card가 렌더링될 때까지 대기 (aria-label 기반)
    await expect(pageA.getByLabel('Traveler card list')).toBeVisible({ timeout: 20000 });
    await expect(pageA.getByLabel('Traveler card for Test_B')).toBeVisible({ timeout: 20000 });

    // 3. Test_B에게 요청 전송 (aria-label 기반)
    await pageA.getByLabel('Traveler card for Test_B').getByLabel('Send request to Test_B').click();

    // 3-1. RequestModal이 뜨는지 대기
    await expect(pageA.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    // 3-2. textarea에 메시지 입력 (접근성 기반)
    await pageA.getByRole('dialog').getByLabel('Message').fill('테스트 요청입니다.');

    // 3-3. Send 버튼 클릭 (aria-label 기반)
    await pageA.getByRole('dialog').getByLabel('Send request').click();

    // 3-4. 요청 전송 완료 대기 (버튼 상태 변경으로 확인)
    await expect(
      pageA.getByLabel('Traveler card for Test_B').getByLabel('Request pending'),
    ).toHaveText('Request Pending', { timeout: 10000 });

    // 4. B 유저 로그인 (새 창)
    const pageB = await browser.newPage();
    await pageB.goto('http://localhost:3000/auth/signin');

    // 접근성 기반 로그인
    await pageB.getByLabel('Email Address').fill('b@test.com');
    await pageB.getByLabel('Password').fill('passwordB');
    await pageB.getByRole('button', { name: 'Sign In' }).click();
    await pageB.waitForURL('**/home');

    // 5. B가 요청 목록에서 A의 요청을 수락
    await pageB.getByRole('link', { name: 'Navigate to requests' }).click();
    await pageB.waitForTimeout(3000); // 네트워크/API 지연을 고려해 3초 대기

    // 'Test_A' 텍스트가 포함된 카드(div)에서 Accept 버튼 클릭 (aria-label 기반)
    await expect(pageB.getByLabel('Request card list')).toBeVisible({ timeout: 20000 });
    await expect(pageB.getByLabel('Request card from Test_A')).toBeVisible({ timeout: 20000 });
    await pageB
      .getByLabel('Request card from Test_A')
      .getByLabel('Accept request from Test_A')
      .click();
    // 요청 수락 완료 대기 (버튼 상태 변경으로 확인)
    await expect(
      pageB.getByLabel('Request card from Test_A').getByLabel('Processing accept'),
    ).toHaveText('Processing...', { timeout: 10000 });

    // 6. 채팅방 자동 생성 확인 (B)
    await pageB.waitForTimeout(7000); // 채팅방 생성 완료를 위한 더 긴 대기
    await pageB.getByRole('link', { name: 'Navigate to chat' }).click();
    await pageB.waitForTimeout(7000); // 네트워크/DB 지연 고려

    // 채팅방 목록이 1개 이상일 때까지(상대방 이름 등으로) 대기
    await expect(pageB.getByLabel('Chat list')).toBeVisible({ timeout: 40000 });
    await expect(pageB.getByLabel('Chat list').getByText('Test_A')).toBeVisible({ timeout: 40000 });
    await pageB.getByLabel('Chat list').getByText('Test_A').click();
    // 채팅방 내부에서 메시지 입력창 등으로 대기
    await expect(pageB.getByLabel('Type a message')).toBeVisible({
      timeout: 40000,
    });

    // 7. A도 채팅방 진입
    await pageA.getByRole('link', { name: 'Navigate to chat' }).click();
    await pageA.waitForTimeout(7000); // 네트워크/DB 지연 고려
    // 채팅방 목록이 1개 이상일 때까지(상대방 이름 등으로) 대기
    await expect(pageA.getByLabel('Chat list')).toBeVisible({ timeout: 40000 });
    await expect(pageA.getByLabel('Chat list').getByText('Test_B')).toBeVisible({ timeout: 40000 });
    // 채팅방 클릭
    await pageA.getByLabel('Chat list').getByText('Test_B').click();
    // 채팅방 내부에서 메시지 입력창 등으로 대기
    await expect(pageA.getByLabel('Type a message')).toBeVisible({
      timeout: 40000,
    });

    // 8. A가 메시지 전송
    await pageA.getByLabel('Type a message').fill('안녕하세요!');
    await pageA.getByLabel('Send message').click();

    // 9. B가 채팅방에서 메시지 확인 (새로고침으로)
    await pageB.getByRole('link', { name: 'Navigate to chat' }).click();
    await pageB.waitForTimeout(3000);
    await expect(pageB.getByLabel('Chat list')).toBeVisible({ timeout: 40000 });
    await expect(pageB.getByText('Test_A')).toBeVisible({ timeout: 40000 });
    await pageB.getByText('Test_A').click();
    await expect(pageB.getByLabel('Type a message')).toBeVisible({
      timeout: 40000,
    });

    // 페이지 새로고침으로 메시지 확인
    await pageB.reload();
    await pageB.waitForTimeout(3000);
    await expect(pageB.getByLabel('Chat list')).toBeVisible({ timeout: 40000 });
    await expect(pageB.getByLabel('Chat list').getByText('Test_A')).toBeVisible({ timeout: 40000 });
    await pageB.getByLabel('Chat list').getByText('Test_A').click();
    await expect(pageB.getByLabel('Type a message')).toBeVisible({
      timeout: 40000,
    });

    // 메시지가 표시되는지 확인
    await expect(pageB.getByLabel('Other message').filter({ hasText: '안녕하세요!' })).toBeVisible({
      timeout: 10000,
    });

    // 10. B가 답장
    await pageB.getByLabel('Type a message').fill('반가워요!');
    await pageB.getByLabel('Send message').click();

    // A가 새로고침으로 B의 답장 확인
    await pageA.reload();
    await pageA.waitForTimeout(3000);
    await expect(pageA.getByLabel('Chat list')).toBeVisible({ timeout: 40000 });
    await expect(pageA.getByLabel('Chat list').getByText('Test_B')).toBeVisible({ timeout: 40000 });
    await pageA.getByLabel('Chat list').getByText('Test_B').click();
    await expect(pageA.getByLabel('Type a message')).toBeVisible({
      timeout: 40000,
    });

    // B의 답장이 표시되는지 확인
    await expect(pageA.getByLabel('Other message').filter({ hasText: '반가워요!' })).toBeVisible({
      timeout: 10000,
    });
  });
});
