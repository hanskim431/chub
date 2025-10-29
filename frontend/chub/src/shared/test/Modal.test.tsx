import { render, screen } from '@testing-library/react';
import Modal from '@/shared/ui/Modal';
import { createRef } from 'react';

describe('Modal', () => {
  test('Modal이 랜더링된다.', () => {
    const contentRef = createRef<HTMLDivElement>();
    render(
      <Modal
        title="면접 질문 세트를 선택하세요"
        onClose={() => {}}
        contentRef={contentRef}
      >
        <div>
          <p>원하는 질문 세트를 골라보세요</p>
        </div>
      </Modal>,
    );
    expect(screen.getByLabelText('modal')).toBeInTheDocument();
  });
});
